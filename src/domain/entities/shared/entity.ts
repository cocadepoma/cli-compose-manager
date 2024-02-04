import { Id } from "../../value-objects/id";

export abstract class Entity<T> {
  id: Id;

  constructor(id: Id) {
    this.id = id;
  }

  public equals(entity?: Entity<T>): boolean {
    if (entity === null || entity === undefined || !(entity instanceof Entity)) {
      return false;
    }

    return this.id === entity.id;
  }
}