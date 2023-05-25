const core = require('@actions/core');
const github = require('@actions/github');

/**
 * Main function to run the GitHub Action.
 */
export function run() {
  const token = core.getInput('token');
  const { context } = github;
  const { payload, issue, actor } = context;
  const { pull_request: pullRequest, repository } = payload;
  const { name: repositoryName } = repository;

  const headBranch = pullRequest.head.ref.toLowerCase();
  const baseBranch = pullRequest.base.ref.toLowerCase();
  const allowedPrefixes = [
    'feature/',
    'refactor/',
    'fix/',
    'hotfix/',
    'release/',
    'ci/',
    'docs/',
    'dependabot/',
    'revert-',
  ];

  if (repositoryName === 'polarishare-frontend-2022') {
    allowedPrefixes.push('seo/', 'test/');
  }

  const isValidBranch = checkBranchName(headBranch, baseBranch, allowedPrefixes);

  if (!isValidBranch) {
    const octokit = github.getOctokit(token);
    const commentBody = createCommentBody(allowedPrefixes);

    octokit.rest.issues.createComment({
      owner: issue.owner,
      repo: issue.repo,
      issue_number: issue.number,
      body: `@${actor}\n${commentBody}`,
    });

    core.setFailed(commentBody);
  }
}

/**
 * Check if branch name starts with any of the allowed prefixes.
 * @param {string} headBranch - Head branch name.
 * @param {string} baseBranch - Base branch name.
 * @param {Array<string>} allowedPrefixes - List of allowed branch name prefixes.
 * @returns {boolean} - Returns true if the branch name is valid, otherwise false.
 */
function checkBranchName(headBranch, baseBranch, allowedPrefixes) {
  if (baseBranch !== 'master') {
    return true;
  }

  return allowedPrefixes.some((prefix) => headBranch.startsWith(prefix));
}

/**
 * Generate the comment body for an invalid branch name.
 * @param {Array<string>} allowedPrefixes - List of allowed branch name prefixes.
 * @returns {string} - Returns the generated comment body.
 */
function createCommentBody(allowedPrefixes) {
  const commentIntro = '### Branch Name must be started with:';
  return allowedPrefixes.reduce((acc, prefix) => acc + `\n- ${prefix}`, commentIntro);
}
