import {
  CognitoUserPool,
  CognitoUser,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { awsConfig } from '../config/aws';
import type { User } from '../store/slices/authSlice';

let userPool: CognitoUserPool;
let cognitoClient: CognitoIdentityProviderClient;

export const initializeCognito = () => {
  const poolData = {
    UserPoolId: awsConfig.userPoolId,
    ClientId: awsConfig.clientId,
  };
  userPool = new CognitoUserPool(poolData);
  
  cognitoClient = new CognitoIdentityProviderClient({
    region: awsConfig.region,
  });
};

const getCognitoUser = (username: string): CognitoUser | null => {
  if (!userPool) return null;
  return new CognitoUser({
    Username: username,
    Pool: userPool,
  });
};

const getCurrentCognitoUser = (): CognitoUser | null => {
  if (!userPool) return null;
  return userPool.getCurrentUser();
};

const parseIdToken = (idToken: string): any => {
  try {
    const payload = idToken.split('.')[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    return {};
  }
};

export const AuthService = {
  async signup(credentials: {
    email: string;
    password: string;
    username?: string;
  }): Promise<{ userId: string; userSub: string }> {
    if (!cognitoClient) throw new Error('Cognito not initialized');

    const username = credentials.username || credentials.email;

    try {
      const response = await cognitoClient.send(
        new SignUpCommand({
          ClientId: awsConfig.clientId,
          Username: username,
          Password: credentials.password,
          UserAttributes: [
            {
              Name: 'email',
              Value: credentials.email,
            },
          ],
        })
      );

      return {
        userId: response.UserSub || username,
        userSub: response.UserSub || username,
      };
    } catch (error) {
      throw error;
    }
  },

  async signin(credentials: {
    username: string;
    password: string;
  }): Promise<{ user: User; accessToken: string; idToken: string }> {
    if (!cognitoClient) throw new Error('Cognito not initialized');

    try {
      const response = await cognitoClient.send(
        new InitiateAuthCommand({
          ClientId: awsConfig.clientId,
          AuthFlow: 'USER_PASSWORD_AUTH',
          AuthParameters: {
            USERNAME: credentials.username,
            PASSWORD: credentials.password,
          },
        })
      );

      if (!response.AuthenticationResult) {
        throw new Error('No authentication result received');
      }

      const idToken = response.AuthenticationResult.IdToken || '';
      const accessToken = response.AuthenticationResult.AccessToken || '';
      const idTokenPayload = parseIdToken(idToken);

      const user: User = {
        id: idTokenPayload.sub || '',
        email: idTokenPayload.email || '',
        username: credentials.username,
        name: idTokenPayload.name || '',
      };

      localStorage.setItem('auth_token', accessToken);
      localStorage.setItem('id_token', idToken);

      return {
        user,
        accessToken,
        idToken,
      };
    } catch (error) {
      throw error;
    }
  },

  async confirmSignup(credentials: {
    username: string;
    code: string;
  }): Promise<{ user: User; accessToken: string; idToken: string }> {
    if (!cognitoClient) throw new Error('Cognito not initialized');

    try {
      await cognitoClient.send(
        new ConfirmSignUpCommand({
          ClientId: awsConfig.clientId,
          Username: credentials.username,
          ConfirmationCode: credentials.code,
        })
      );

      const cognitoUser = getCognitoUser(credentials.username);
      if (!cognitoUser) throw new Error('Failed to create Cognito user');

      return new Promise((resolve, reject) => {
        cognitoUser.getSession((err: any, session: any) => {
          if (err) {
            reject(err);
          } else if (session && session.isValid()) {
            const idToken = session.getIdToken();
            const accessToken = session.getAccessToken();
            const idTokenPayload = idToken.payload;

            const user: User = {
              id: idTokenPayload.sub,
              email: idTokenPayload.email,
              username: cognitoUser.getUsername(),
              name: idTokenPayload.name || '',
            };

            localStorage.setItem('auth_token', accessToken.getJwtToken());
            localStorage.setItem('id_token', idToken.getJwtToken());

            resolve({
              user,
              accessToken: accessToken.getJwtToken(),
              idToken: idToken.getJwtToken(),
            });
          } else {
            reject(new Error('Failed to get session after confirmation'));
          }
        });
      });
    } catch (error) {
      throw error;
    }
  },

  async signout(): Promise<void> {
    const cognitoUser = getCurrentCognitoUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('id_token');
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const cognitoUser = getCurrentCognitoUser();
      if (!cognitoUser) return null;

      return new Promise((resolve) => {
        cognitoUser.getSession((err: any, session: any) => {
          if (err) {
            resolve(null);
          } else if (session && session.isValid()) {
            const idToken = session.getIdToken();
            const idTokenPayload = idToken.payload;

            resolve({
              id: idTokenPayload.sub,
              email: idTokenPayload.email,
              username: cognitoUser.getUsername(),
              name: idTokenPayload.name || '',
            });
          } else {
            resolve(null);
          }
        });
      });
    } catch {
      return null;
    }
  },

  async getAccessToken(): Promise<string | null> {
    try {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        return storedToken;
      }

      const cognitoUser = getCurrentCognitoUser();
      if (!cognitoUser) return null;

      return new Promise((resolve) => {
        cognitoUser.getSession((err: any, session: any) => {
          if (err) {
            resolve(null);
          } else if (session && session.isValid()) {
            resolve(session.getAccessToken().getJwtToken());
          } else {
            resolve(null);
          }
        });
      });
    } catch {
      return null;
    }
  },

  async getIdToken(): Promise<string | null> {
    try {
      const storedIdToken = localStorage.getItem('id_token');
      if (storedIdToken) {
        return storedIdToken;
      }

      const cognitoUser = getCurrentCognitoUser();
      if (!cognitoUser) return null;

      return new Promise((resolve) => {
        cognitoUser.getSession((err: any, session: any) => {
          if (err) {
            resolve(null);
          } else if (session && session.isValid()) {
            resolve(session.getIdToken().getJwtToken());
          } else {
            resolve(null);
          }
        });
      });
    } catch {
      return null;
    }
  },
};
