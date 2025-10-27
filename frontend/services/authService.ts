import { Amplify, Auth } from 'aws-amplify';
import { User } from '../store/slices/authSlice';

// Configure Amplify with Cognito
export const initializeAuth = (config: {
  region: string;
  userPoolId: string;
  clientId: string;
}) => {
  Amplify.configure({
    Auth: {
      region: config.region,
      userPoolId: config.userPoolId,
      userPoolWebClientId: config.clientId,
      identityPoolId: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID,
    },
  });
};

export const AuthService = {
  async signup(credentials: {
    email: string;
    password: string;
    username?: string;
  }): Promise<{ userId: string; userSub: string }> {
    try {
      const username = credentials.username || credentials.email;
      const result = await Auth.signUp({
        username,
        password: credentials.password,
        attributes: {
          email: credentials.email,
        },
      });

      return {
        userId: result.userSub,
        userSub: result.userSub,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Signup failed',
      );
    }
  },

  async confirmSignup(credentials: {
    username: string;
    code: string;
  }): Promise<{
    user: User;
    accessToken: string;
    idToken: string;
  }> {
    try {
      await Auth.confirmSignUp(credentials.username, credentials.code);

      // Auto sign in after confirmation
      return this.signin({
        username: credentials.username,
        password: '', // Password will be prompted separately
      });
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Confirmation failed',
      );
    }
  },

  async signin(credentials: {
    username: string;
    password: string;
  }): Promise<{
    user: User;
    accessToken: string;
    idToken: string;
  }> {
    try {
      const result = await Auth.signIn(
        credentials.username,
        credentials.password,
      );

      const session = result.signInUserSession;
      const idToken = session.idToken;
      const accessToken = session.accessToken;

      const user: User = {
        id: idToken.payload.sub,
        email: idToken.payload.email,
        username: result.username,
        name: idToken.payload.name,
      };

      // Store tokens for API calls
      localStorage.setItem('auth_token', accessToken.jwtToken);
      localStorage.setItem('id_token', idToken.jwtToken);

      return {
        user,
        accessToken: accessToken.jwtToken,
        idToken: idToken.jwtToken,
      };
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Sign in failed',
      );
    }
  },

  async signout(): Promise<void> {
    try {
      await Auth.signOut();
      localStorage.removeItem('auth_token');
      localStorage.removeItem('id_token');
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Sign out failed',
      );
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const cognutoUser = await Auth.currentAuthenticatedUser();
      const idToken = cognutoUser.signInUserSession.idToken;

      const user: User = {
        id: idToken.payload.sub,
        email: idToken.payload.email,
        username: cognutoUser.username,
        name: idToken.payload.name,
      };

      return user;
    } catch (error) {
      return null;
    }
  },

  async getAccessToken(): Promise<string | null> {
    try {
      const session = await Auth.currentSession();
      return session.getAccessToken().getJwtToken();
    } catch {
      return null;
    }
  },

  async getIdToken(): Promise<string | null> {
    try {
      const session = await Auth.currentSession();
      return session.getIdToken().getJwtToken();
    } catch {
      return null;
    }
  },

  async resendConfirmationCode(username: string): Promise<void> {
    try {
      await Auth.resendSignUp(username);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Resend failed',
      );
    }
  },

  async forgotPassword(username: string): Promise<void> {
    try {
      await Auth.forgotPassword(username);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Forgot password failed',
      );
    }
  },

  async confirmNewPassword(
    username: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    try {
      await Auth.forgotPasswordSubmit(username, code, newPassword);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Password reset failed',
      );
    }
  },
};
