import { Expose } from 'class-transformer';

export class ProfileResponseDto {
  @Expose()
  errno: number;

  @Expose()
  data: {
    id: number;

    username: string;

    password: string;

    salt: string;

    logs?: any;

    roles?: any;

    profile: {
      id: number;
      nickname: string;
      gender: number;
      photo: string;
      address: string;
    };
  };
}
