#! /usr/bin/env node
import * as fs from 'fs';
import { root } from './handle-package';
import handleHistory from './handle-history';
import importNc from './import-nc';
import globalizeFiles from './globalize-files';
import createServer from './create-server';
import profiler from './profiler';
import suggestions from './suggestions';

importNc();

const server = createServer();

(<any>server).context.profiler = profiler;
globalizeFiles(server);
handleHistory(server);
suggestions(server);
