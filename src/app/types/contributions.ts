export type Contribution = {
  date: string;
  count: number;
};

export type Contributions = Contribution[];

export type ContributionsResponse = {
  data: {
    contributions: Contributions;
    totalContributionsCount: number;
  };
};
