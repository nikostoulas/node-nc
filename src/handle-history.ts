import Config from './config';
import * as fs from 'fs';
import * as path from 'path';
import { root, isInNodeProject } from './handle-package';
import { uniqueKeepLatest } from './helper';
import * as os from 'os';

function getHistoryPath() {
  if (!isInNodeProject) {
    return path.join(os.homedir(), Config.config.historyFileName);
  }
  if (path.isAbsolute(Config.config.historyFileName)) {
    return Config.config.historyFileName;
  }
  return path.join(root, Config.config.historyFileName);
}

export default function handle(server) {
  if (!Config.config.writeHistoryFile) {
    return;
  };

  const historyFile = getHistoryPath();

  if (!fs.existsSync(historyFile)) {
    fs.writeFileSync(historyFile, '');
  }

  fs.readFileSync(historyFile)
    .toString()
    .split(`\n`)
    .reverse()
    .filter(line => line.trim())
    .map(line => server.history.push(line));

  process.on('exit', function () {
    let allLines = fs.readFileSync(historyFile)
      .toString()
      .split(`\n`);

    allLines = uniqueKeepLatest(allLines.concat(server.lines));

    fs.writeFileSync(historyFile,
      allLines
        .filter(line => line.trim()).join('\n') + '\n');
  });

}
