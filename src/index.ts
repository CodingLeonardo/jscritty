#!/usr/bin/env node

import Jscritty from "./jscritty";
import { args } from "./cli";

console.log(args);

const jscritty = new Jscritty();
jscritty.apply(args);
jscritty.save();
