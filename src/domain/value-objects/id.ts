import { ValueObject } from "./shared/value-object";

interface IdProps {
  value: string;
}

export class Id extends ValueObject<IdProps> {
  private constructor(props: IdProps) {
    super(props);
  }

  public static create(): Id {
    return new Id({ value: crypto.randomUUID() });
  }

  public get value(): string {
    return this.props.value;
  }
}