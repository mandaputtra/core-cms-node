import express from 'express';
import core from '../core';
import { auth } from '../user/middleware';
import { VideoController } from './controller';

const { wrap } = core.utils;
const routes = express.Router();

routes.get('/video',
  auth(),
  wrap(VideoController.view),
);

export default routes;
