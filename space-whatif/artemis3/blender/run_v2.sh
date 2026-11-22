#!/bin/bash
cd /home/user/superpowers/space-whatif/artemis3/blender
for s in p1 p2 p3 p4 p5 p6 p7 p8 p9; do /tmp/bl311/bin/python scene3d_v2.py $s 1 96 8 80 3 > frames3/log_$s.txt 2>&1; done
for s in orion lander sls ship dock_lander dock_ship; do /tmp/bl311/bin/python scene3d_v2.py $s 1 96 16 100 1 > frames3/log_$s.txt 2>&1; done
echo ALL_DONE > frames3/done.txt
