export class RevisionTracker {
  private revisions =
    new Map<string, number>();

  increment(
    workflowId: string
  ) {
    const current =
      this.revisions.get(
        workflowId
      ) || 0;

    this.revisions.set(
      workflowId,
      current + 1
    );

    return current + 1;
  }

  get(
    workflowId: string
  ) {
    return this.revisions.get(
      workflowId
    ) || 0;
  }
}