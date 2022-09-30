import {
  buildSchema,
  DocumentType,
  index,
  modelOptions,
  pre,
  prop,
} from "@typegoose/typegoose";
import mongoose, { Model } from "mongoose";
import { CreateUserInput } from "../schemas/auth.schema";
import * as argon from "argon2";

export interface UserDoc extends DocumentType<User> {
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserModelType extends Model<UserDoc> {
  build(user: CreateUserInput): UserDoc;
}

@pre<User>("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const hash = await argon.hash(this.password);
  this.password = hash;
  return;
})
@index({ email: 1 })
@modelOptions({
  schemaOptions: {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  },
})
export class User {
  @prop({ required: true })
  public name!: string;

  @prop({ required: true, unique: true })
  public email!: string;

  @prop({ required: true })
  public password!: string;

  public static build(user: CreateUserInput) {
    return new UserModel(user);
  }
}
const userSchema = buildSchema(User);
const UserModel = mongoose.model<UserDoc, UserModelType>("User", userSchema);
// const UserModel = getModelForClass<typeof User, UserDoc>(User, {schemaOptions: {timestamps: true}});

export { UserModel };
