import { program } from "commander";

import { TranspileCommand } from "./commands/TranspileCommand.js";

program
  .command("transpile")
  .description("transpile BMG file to JSON")
  .argument("<input>", "BMG file")
  .argument("[output]", "JSON output file")
  .action(TranspileCommand);

program.parse();
