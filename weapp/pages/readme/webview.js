Page({
  data: {},
  onLoad({ user, repo, branch }) {
    this.setData({
      user: user,
      repo: repo,
      branch: branch,
    });
  }
});