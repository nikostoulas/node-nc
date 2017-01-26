#! /usr/bin/env node
import * as fs from 'fs';
import { root } from './handle-package';
import handleHistory from './handle-history';
import importConsole from './import-console';
import globalizeFiles from './globalize-files';
import createServer from './create-server';

importConsole();

const server = createServer();

globalizeFiles(server);
handleHistory(server);
