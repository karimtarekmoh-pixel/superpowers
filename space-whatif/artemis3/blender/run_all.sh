#!/bin/bash
cd /home/user/superpowers/space-whatif/artemis3/blender
for s in "dock_lander 1 96" "dock_ship 1 96" "lander 1 96" "sls 1 96" "ship 1 96"; do
  set -- $s; /tmp/bl311/bin/python scene3d.py $1 $2 $3 24 800 > frames2/log_$1.txt 2>&1
done
echo ALL_BLENDER_DONE > frames2/done.txt
