import { Id } from "../value-objects/id";
import { Name } from "../value-objects/name";
import { Entity } from "./shared/entity";

export type ValueType = 'Frontend' | 'Backend' | 'Common';

export interface ComposeServiceData {
  id: Id;
  name: Name;
  containerName: Name;
  type: ValueType;
  status?: string;
}


export interface ComposeServiceProps {
  name: string;
  containerName: string;
  type: string;
  status?: string;
}

export class ComposeService extends Entity<ComposeServiceData>{
  public readonly name: Name;
  public readonly containerName: Name;
  public readonly type: ValueType;
  public status?: string;

  constructor(props: ComposeServiceData) {
    super(props.id);

    this.name = props.name;
    this.containerName = props.containerName;
    this.type = props.type;
    this.status = props.status;
  }

  public static create(props: ComposeServiceProps): ComposeService {
    try {
      const name = Name.create(props.name);
      const containerName = Name.create(props.containerName);
      const id = Id.create();
      const type = (props.type.includes('backend') ? 'Backend' : props.type.includes('frontend') ? 'Frontend' : 'Common') as ValueType;
      const status = props.status?.includes('Up') ? 'ON' : 'OFF';

      return new ComposeService({ id, name, containerName, type, status });
    } catch (error) {
      throw Error(error as any);
    }
  }
}
