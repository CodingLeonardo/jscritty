#!/usr/bin/env node

import Alacritty from "./alacritty";
import { args } from "./cli";

const alacritty = new Alacritty();
alacritty.apply(args);
alacritty.save();

