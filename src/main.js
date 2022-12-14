const core = require('@actions/core');
const github = require('@actions/github');

export function run() {
  // input
  const token = core.getInput('token');

  // var
  const branch = github.context.payload.pull_request.head.ref.toLowerCase();
  const allowPrefixList = ['feat/', 'refactor/', 'fix/', 'hotfix/', 'ci/', 'docs/', 'dependabot/', 'revert-'];

  if (github.context.payload.repository.name === 'polarishare-frontend-2022') {
    allowPrefixList.push('seo/', 'test/');
  }

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

    let comment = `### Branch Name must be started with:`;
    allowPrefixList.forEach((allowPrefix) => {
      comment += `\n- ${allowPrefix}`;
    });

    octokit.rest.issues.createComment({
      owner: issue.owner,
      repo: issue.repo,
      issue_number: issue.number,
      body: `@${github.context.actor}\n${comment}`,
    });

    core.setFailed(comment);
  }
}
