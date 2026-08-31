import { beListTasksUrl } from '@claude-actions/task/contracts';
import { createTaskApi } from '@claude-actions/task/application-api';

const DEFAULT_PORT = 3333;

const port = Number(process.env.PORT ?? DEFAULT_PORT);
const server = createTaskApi().listen(port, () => {
  console.log(`Task API listening at http://localhost:${port}${beListTasksUrl}`);
});

server.on('error', console.error);
