import { program } from "commander";

import { PatchCommand } from "./commands/PatchCommand.js";
import { TranspileCommand } from "./commands/TranspileCommand.js";

program
  .command("transpile")
  .description("transpile a BMG file to JSON")
  .argument("<input>", "BMG file")
  .argument("[output]", "JSON output file")
  .action(TranspileCommand);

program
  .command("patch")
  .description("patch a BMG file using a transpiled JSON")
  .argument("<source>", "original BMG file")
  .argument("<input>", "transpiled JSON file")
  .argument("[output]", "BMG output file")
  .action(PatchCommand);

program.parse();
