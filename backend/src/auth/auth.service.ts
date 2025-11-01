import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

interface SignupDto {
  email: string;
  password: string;
}

interface LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.usersService.findUserByEmail(
      signupDto.email,
    );
    if (existingUser) {
      return { error: 'User already exists' };
    }

    const user = await this.usersService.createUser(
      signupDto.email,
      signupDto.password,
    );

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return {
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findUserByEmail(loginDto.email);
    if (!user) {
      return { error: 'Invalid credentials' };
    }

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return {
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    };
  }

  validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }
}
