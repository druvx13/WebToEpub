# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automating fork maintenance and release synchronization with the upstream repository.

## Workflows

### 1. Sync Fork with Upstream (`sync-fork.yml`)

**Purpose:** Automatically keeps all branches in the fork synchronized with the upstream repository (dteviot/WebToEpub).

**Triggers:**
- **Schedule:** Runs every 6 hours automatically
- **Manual:** Can be triggered manually via the Actions tab

**What it does:**
1. Fetches all branches from the upstream repository
2. For each upstream branch:
   - If the branch exists in the fork, it attempts to fast-forward merge the changes
   - If fast-forward is not possible, it performs a regular merge
   - If the branch doesn't exist in the fork, it creates it
3. Pushes all updated branches to the fork

**Benefits:**
- Keeps your fork up-to-date with the latest changes from upstream
- Synchronizes all branches, not just the default branch
- Handles merge conflicts gracefully by skipping problematic branches

### 2. Sync Releases from Upstream (`sync-releases.yml`)

**Purpose:** Automatically mirrors releases from the upstream repository to the fork.

**Triggers:**
- **Schedule:** Runs every 6 hours (30 minutes offset from fork sync)
- **Manual:** Can be triggered manually via the Actions tab

**What it does:**
1. Fetches all releases from the upstream repository
2. Compares with existing releases in the fork
3. For each new release:
   - Downloads release metadata (name, description, prerelease status)
   - Fetches and pushes the release tag
   - Creates the release in the fork with attribution to upstream
   - Downloads all release assets (files)
   - Uploads assets to the fork's release

**Benefits:**
- Automatically publishes new releases from upstream to your fork
- Preserves release assets (files) for convenience
- Adds attribution to indicate the release is from upstream
- Maintains release metadata (prerelease status, etc.)

## Manual Triggering

Both workflows can be triggered manually:

1. Go to the **Actions** tab in your repository
2. Select the workflow you want to run
3. Click **Run workflow**
4. Choose the branch (usually the default branch)
5. Click **Run workflow** to start

## Configuration

Both workflows are configured to work with:
- **Upstream repository:** `dteviot/WebToEpub`
- **Fork repository:** `druvx13/WebToEpub`

If you fork this repository again or the upstream changes, you may need to update these values in the workflow files.

## Permissions

These workflows require the following permissions:
- **Contents:** Write (to push branches, tags, and create releases)

The workflows use `GITHUB_TOKEN` which is automatically provided by GitHub Actions with the permissions specified in each workflow file.

## Troubleshooting

### Fork sync fails with merge conflicts

If a branch has diverged significantly from upstream and cannot be merged automatically, the workflow will skip that branch and continue with others. You'll need to manually resolve conflicts for that specific branch.

### Release sync doesn't create a release

Check that:
1. The upstream release is not a draft (drafts are intentionally skipped)
2. The release tag exists in the upstream repository
3. The workflow has appropriate permissions

### Workflow doesn't run on schedule

GitHub Actions scheduled workflows may experience delays during high-load periods. You can always trigger workflows manually if needed.

## Monitoring

To check workflow status:
1. Go to the **Actions** tab in your repository
2. Click on the workflow name to see run history
3. Click on a specific run to see detailed logs

## Contributing

If you find issues with these workflows or have suggestions for improvements, please open an issue or submit a pull request.
