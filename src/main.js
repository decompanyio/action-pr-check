const core = require('@actions/core');
const github = require('@actions/github');

export function run() {
  // input
  const branch = core.getInput('branch').toLowerCase();
  const token = core.getInput('token');

  // var
  const allowPrefixList = ['feature/', 'fix/', 'seo/', 'refactor/', 'hotfix/', 'ci/', 'dependabot/'];
  let check = false;

  for (let allowPrefix in allowPrefixList) {
    if (branch.startsWith(allowPrefix)) {
      console.log('check:', branch.startsWith(allowPrefix), 'branch:', branch, 'prefix:', allowPrefix);
      check = true;
      break;
    }
  }

  if (!check) {
    const octokit = github.getOctokit(token);
    const issue = github.context.issue();
    const comment = `PR Title must be started with: ${allowPrefixList}`;

    octokit.rest.issues.createComment({
      owner: issue.owner,
      repo: issue.repo,
      issue_number: issue.number,
      body: comment,
    });

    core.setFailed(comment);
  }
}
