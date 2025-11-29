import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ActivitiesService } from './activities.service';
import { UsersService } from '../users/users.service';

@Controller('api/activities')
export class ActivitiesController {
  private readonly logger = new Logger(ActivitiesController.name);

  constructor(
    private activitiesService: ActivitiesService,
    private usersService: UsersService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('cognito'))
  async createActivity(@Request() req, @Body() body: any) {
    try {
      if (!body.type) {
        throw new BadRequestException('Type is required');
      }
      if (!body.date) {
        throw new BadRequestException('Date is required');
      }
      if (body.duration === undefined || body.duration === null) {
        throw new BadRequestException('Duration is required');
      }

      const userEmail = req.user.email;

      // Ensure user exists in database
      let user = await this.usersService.findUserByEmail(userEmail);
      if (!user) {
        // Auto-create user from Cognito data
        user = await this.usersService.createUser(userEmail);
      }

      const activity = await this.activitiesService.createActivity({
        type: body.type,
        date: body.date,
        duration: Number(body.duration),
        distance: body.distance ? Number(body.distance) : 0,
        photo: body.photo || body.photoUrl,
        ownerId: user.id,
      });
      return activity;
    } catch (error) {
      this.logger.error(`Failed to create activity: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create activity: ${error.message}`);
    }
  }

  @Get()
  async getAllActivities() {
    return this.activitiesService.getAllActivities();
  }

  @Get('me')
  @UseGuards(AuthGuard('cognito'))
  async getMyActivities(@Request() req) {
    const userEmail = req.user.email;
    const user = await this.usersService.findUserByEmail(userEmail);
    if (!user) {
      return [];
    }
    return this.activitiesService.getActivitiesByUser(user.id);
  }

  @Get('user/:userId')
  async getActivitiesByUser(@Param('userId') userId: string) {
    return this.activitiesService.getActivitiesByUser(userId);
  }

  @Get(':id')
  async getActivityById(@Param('id') id: string) {
    return this.activitiesService.getActivityById(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('cognito'))
  async deleteActivity(@Param('id') id: string, @Request() req) {
    const activity = await this.activitiesService.getActivityById(id);
    if (!activity) {
      throw new BadRequestException('Activity not found');
    }

    // Get the local user to compare with activity owner
    const userEmail = req.user.email;
    const user = await this.usersService.findUserByEmail(userEmail);
    if (!user || activity.ownerId !== user.id) {
      throw new BadRequestException('Unauthorized to delete this activity');
    }

    return this.activitiesService.deleteActivity(id);
  }
}
