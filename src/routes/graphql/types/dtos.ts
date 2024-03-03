export interface IPostDto {
  title: string;
  content: string;
  authorId: string;
}

export interface IUserDto {
  id: string;
  name: string;
  balance: number;
}

export interface IProfileDto {
  isMale: boolean;
  yearOfBirth: number;
  userId: string;
}
