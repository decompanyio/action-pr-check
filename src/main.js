const core = require('@actions/core');
const github = require('@actions/github');

export function run() {
  // input
  const branch = github.context.payload.pull_request.head.ref.toLowerCase();
  const token = core.getInput('token');

  // var
  const allowPrefixList = ['feature/', 'fix/', 'seo/', 'refactor/', 'hotfix/', 'ci/', 'dependabot/'];
  let check = false;

  for (let i = 0; i < allowPrefixList.length; i++) {
    if (branch.startsWith(allowPrefixList[i])) {
      console.log('check:', branch.startsWith(allowPrefixList[i]), 'branch:', branch, 'prefix:', allowPrefixList[i]);
      check = true;
      break;
    }
  }

  if (!check) {
    const octokit = github.getOctokit(token);
    const issue = github.context.issue;
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
