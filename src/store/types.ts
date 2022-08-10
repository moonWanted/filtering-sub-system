export interface ICondition {
  definition_id: string;
  operator: string;
  value: string | string[];
}

export interface IFilter {
  id: string;
  name: string;
  conditions: ICondition[];
}

export interface IFilterDefinition {
  id: string;
  label: string;
  type: string;
  operators: string[];
  default_value: string | null;
}
