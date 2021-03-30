#!/bin/bash
deno run --allow-net --allow-read https://deno.land/std@0.90.0/http/file_server.ts ../public -p 31337 --host localhost --cors 
