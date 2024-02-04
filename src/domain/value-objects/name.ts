import { ValueObject } from "./shared/value-object";

interface NameProps {
  value: string;
}

export class Name extends ValueObject<NameProps> {

  private constructor(props: NameProps) {
    super(props);
  }

  public static create(name: string): Name {
    if (name.length === 0) {
      throw new Error("name is required");
    } else {
      return new Name({ value: this.format(name) });
    }
  }

  public get value(): string {
    return this.props.value
  };

  private static format(name: string): string {
    return name.trim();
  }
}