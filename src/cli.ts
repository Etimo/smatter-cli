#!/usr/bin/env node
import {
  intro,
  outro,
  select,
  text,
  spinner,
  note,
  cancel,
  isCancel,
} from '@clack/prompts';
import color from 'picocolors';
import { simpleGit } from 'simple-git';
import gradient from 'gradient-string';
import process from 'node:process';

// Helper function to handle cancellation
function handleCancel() {
  cancel('Operation cancelled');
  process.exit(0);
}

// Wrapper for interactive prompts
async function prompt<T>(callback: () => Promise<T>): Promise<T> {
  const result = await callback();
  if (isCancel(result)) {
    handleCancel();
  }
  return result;
}

async function main() {
  console.clear();

  // setup signal handlers for Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n');
    handleCancel();
  });
  process.on('SIGTERM', () => {
    console.log('\n');
    handleCancel();
  });

  const etimoGradient = gradient(['#5c9bd8', '#6eb1ef', '#5c9bd8']);

  intro(`
    ${etimoGradient('  █╗       ██╗                                              ')}
    ${etimoGradient('  ╚╝  ██╗  ╚═╝   ███████╗ ████████╗ ██╗ ███╗   ███╗  ██████╗   ')}
    ${etimoGradient('  █╗  ╚═╝  ██╗   ██╔════╝ ╚══██╔══╝ ██║ ████╗ ████║ ██╔═══██╗  ')}
    ${etimoGradient('  █║  ██╗  ██║   █████╗      ██║    ██║ ██╔████╔██║ ██║   ██║  ')}
    ${etimoGradient('  █║  ██║  ██║   ██╔══╝      ██║    ██║ ██║╚██╔╝██║ ██║   ██║  ')}
    ${etimoGradient('  ╚╝  ██║  ╚═╝   ███████╗    ██║    ██║ ██║ ╚═╝ ██║ ╚██████╔╝  ')}
    ${etimoGradient('      ██║        ╚══════╝    ╚═╝    ╚═╝ ╚═╝     ╚═╝  ╚═════╝   ')}
    ${etimoGradient('      ╚═╝                                                   ')}
  `);

  // intro(`
  //   ${retro('███████╗███╗   ███╗ █████╗ ████████╗████████╗███████╗██████╗ ')}
  //   ${retro('██╔════╝████╗ ████║██╔══██╗╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗')}
  //   ${retro('███████╗██╔████╔██║███████║   ██║      ██║   █████╗  ██████╔╝')}
  //   ${retro('╚════██║██║╚██╔╝██║██╔══██║   ██║      ██║   ██╔══╝  ██╔══██╗')}
  //   ${retro('███████║██║ ╚═╝ ██║██║  ██║   ██║      ██║   ███████╗██║  ██║')}
  //   ${retro('╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝')}
  // `);

  intro(color.bgCyan(color.black(' Smatter Coding Assessment ')));

  note(
    `🐦 Welcome to the Smatter CLI!\nAnswer a few questions, and we'll clone the project to your machine and set up a git branch for you.`,
  );

  const caseType = await prompt(() =>
    select({
      message: 'Which part of the case would you like to work on?',
      options: [
        {
          value: 'frontend',
          label: 'Frontend',
          hint: 'Work with React, on the UI/UX features',
        },
        {
          value: 'backend',
          label: 'Backend',
          hint: 'Work on API and server features',
        },
      ],
    }),
  );

  const username = await prompt(() =>
    text({
      message: 'What is your name? This will be used to name your work branch',
      placeholder: 'johndoe',
      validate: (value) => {
        if (!value) return 'Please enter your name';
        if (!/^[a-zA-Z0-9-]+$/.test(value))
          return 'Invalid name, only letters, numbers, and hyphens are allowed';
      },
    }),
  );

  const s = spinner();
  try {
    const git = simpleGit({
      timeout: {
        block: 10000, // 10 seconds
      },
    });

    s.start('Cloning the Smatter repository');

    try {
      await git.clone(
        'https://github.com/Etimo/smatter.git',
        './smatter-repo',
        ['--progress'],
      );
      s.stop('Repository cloned successfully');
    } catch (gitError) {
      console.log('Debug: Clone failed');
      throw gitError;
    }

    await git.cwd('smatter-repo');

    const branchName = `assessment/${username.toString()}/${caseType}`;
    s.start('Creating your work branch');
    await git.checkoutLocalBranch(branchName);
    s.stop('Branch created successfully');

    outro(
      color.green(`
  ✨ All set! Here's what to do next:
  ${color.cyan('1.')} Open the 'smatter-repo' directory in your favorite code editor
  ${color.cyan('2.')} Follow the instructions in the README.md file
  ${color.cyan('3.')} Have fun! 🚀
  ${color.yellow('Your work branch:')} ${branchName}
        `),
    );
  } catch (error) {
    s.stop('An error occurred');
    cancel(
      color.red(
        `Failed to set up the project: ${error instanceof Error ? error.message : 'error'}`,
      ),
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(color.red('An unexpected error occurred:'), error);
  process.exit(1);
});
