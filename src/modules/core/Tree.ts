import { immerable } from "immer";

export default class Tree<T> {
  [immerable] = true;
  public value: T;
  private _branches: Tree<T>[];
  private _parent: Tree<T> | null;
  private _depth: number;

  public growBranch(value: T) {
    const branch = new Tree(value, this);
    this._branches.push(branch);
    return branch;
  }

  public pruneBranch(branch: Tree<T>) {
    this._branches.splice(this.branches.indexOf(branch), 1);
  }

  public get branches(): readonly Tree<T>[] {
    return this._branches;
  }

  public get parent(): Tree<T> | null {
    return this._parent;
  }

  public get depth(): number {
    return this._depth;
  }

  private constructor(value: T, parent: Tree<T> | null) {
    this.value = value;
    this._branches = [];
    this._parent = parent;
    // Zero depth for null parent
    this._depth = (parent?.depth ?? -1) + 1;
  }

  public static from<T>(value: T): Tree<T> {
    return new Tree(value, null);
  }
}
