import { Amplify } from 'aws-amplify';
import Auth from '@aws-amplify/auth';
import type { User } from '../store/slices/authSlice';

type CognitoUser = any; 

export const initializeAuth = (config: {
  region: string;
  userPoolId: string;
  clientId: string;
}) => {
  Amplify.configure({
    Auth: {
      mandatorySignIn: true,
      region: config.region,
      userPoolId: config.userPoolId,
      userPoolWebClientId: config.clientId,
      identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID,
      authenticationFlowType: 'USER_PASSWORD_AUTH',
    } as any,
  });
};

export const AuthService = {
  async signup(credentials: { email: string; password: string; username?: string }): Promise<{ userId: string; userSub: string }> {
    const username = credentials.username || credentials.email;

    const result: any = await Auth.signUp({
      username,
      password: credentials.password,
      attributes: { email: credentials.email },
    } as any);

    const userSub = (result.user?.username) || username;

    return {
      userId: userSub,
      userSub: userSub,
    };
  },

  async signin(credentials: { username: string; password: string }): Promise<{ user: User; accessToken: string; idToken: string }> {
    const result: CognitoUser = await Auth.signIn({
      username: credentials.username,
      password: credentials.password,
    } as any);

    const session = result.getSignInUserSession();

    const user: User = {
      id: session.idToken.payload.sub,
      email: session.idToken.payload.email,
      username: result.getUsername(),
      name: session.idToken.payload.name,
    };

    localStorage.setItem('auth_token', session.accessToken.jwtToken);
    localStorage.setItem('id_token', session.idToken.jwtToken);

    return { user, accessToken: session.accessToken.jwtToken, idToken: session.idToken.jwtToken };
  },
  
  
  async confirmSignup(credentials: { username: string; code: string }): Promise<{ user: User; accessToken: string; idToken: string }> {
  await Auth.confirmSignUp({
    username: credentials.username,
    code: credentials.code,
  } as any);

  const result: any = await Auth.signIn({
    username: credentials.username,
    password: credentials.code, 
  } as any);

  const session = result.getSignInUserSession();

  const user: User = {
    id: session.idToken.payload.sub,
    email: session.idToken.payload.email,
    username: result.getUsername(),
    name: session.idToken.payload.name,
  };

  return { user, accessToken: session.accessToken.jwtToken, idToken: session.idToken.jwtToken };
},



  async signout(): Promise<void> {
    await Auth.signOut() as any;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('id_token');
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const AuthAny: any = Auth;
      const cognitoUser = await AuthAny.currentAuthenticatedUser();
      const session = cognitoUser.getSignInUserSession();

      return {
        id: session.idToken.payload.sub,
        email: session.idToken.payload.email,
        username: cognitoUser.getUsername(),
        name: session.idToken.payload.name,
      };
    } catch {
      return null;
    }
  },

  async getAccessToken(): Promise<string | null> {
    try {
      const AuthAny: any = Auth;
      const session = await AuthAny.currentSession();
      return session.getAccessToken().getJwtToken();
    } catch {
      return null;
    }
  },

  async getIdToken(): Promise<string | null> {
    try {
      const AuthAny: any = Auth;
      const session = await AuthAny.currentSession();
      return session.getIdToken().getJwtToken();
    } catch {
      return null;
    }
  },
};
