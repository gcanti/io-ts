import { Validation } from '../index'

export interface Reporter<A> {
  report: (validation: Validation<any>) => A;
}
