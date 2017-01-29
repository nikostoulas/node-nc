#! /usr/bin/env node
import * as fs from 'fs';
import { root } from './handle-package';
import handleHistory from './handle-history';
import importNc from './import-nc';
import globalizeFiles from './globalize-files';
import createServer from './create-server';

importNc();

const server = createServer();

globalizeFiles(server);
handleHistory(server);
