/* Kettlebell Workouts — exercise database
 * Each pose is a side-view figure (facing right) in a 220x180 viewBox.
 * Ground line at y=164. Limbs are [shoulder/hip, knee/elbow, foot/hand] point triples.
 */

const EXERCISES = [
  // ---------------- FULL BODY ----------------
  {
    id: 'swing', name: 'Kettlebell Swing', groups: ['full', 'lower'], level: 2,
    cue: 'Hinge at the hips and brace your core — snap your glutes to float the bell up to chest height.',
    pose: {
      head: [107, 52], spine: [[105, 63], [101, 106]],
      armsF: [[105, 67, 106, 84, 105, 99]], armsB: [[102, 67, 101, 84, 100, 99]],
      legsF: [[101, 106, 108, 136, 105, 164]], legsB: [[101, 106, 97, 136, 92, 164]],
      kb: [102, 108],
      arrows: [{ from: [88, 152], ctrl: [72, 122], to: [88, 100] }]
    }
  },
  {
    id: 'snatch', name: 'Snatch', groups: ['full'], level: 3,
    cue: 'One motion: swing down, pull through, lock out under the bell. Keep that elbow fast!',
    pose: {
      head: [108, 54], spine: [[106, 65], [102, 106]],
      armsF: [[107, 69, 112, 40, 114, 24]], armsB: [[102, 69, 95, 86, 104, 90]],
      legsF: [[102, 106, 110, 134, 107, 164]], legsB: [[102, 106, 95, 136, 89, 164]],
      kb: [115, 16],
      arrows: [{ from: [96, 152], ctrl: [66, 88], to: [118, 20] }]
    }
  },
  {
    id: 'tgu', name: 'Turkish Get-Up', groups: ['core', 'full'], level: 3,
    cue: 'One arm up, eyes on the bell — move slow and control every position.',
    pose: {
      head: [105, 52], spine: [[104, 63], [102, 108]],
      armsF: [[106, 67, 110, 40, 112, 24]], armsB: [[101, 67, 98, 92, 99, 116]],
      legsF: [[102, 108, 107, 136, 105, 164]], legsB: [[102, 108, 97, 136, 93, 164]],
      kb: [113, 16],
      arrows: [{ from: [92, 152], ctrl: [62, 82], to: [116, 22] }]
    }
  },
  {
    id: 'sumo-row', name: 'Sumo Deadlift High Row', groups: ['full', 'lower'], level: 2,
    cue: 'Wide stance, flat back — pull the bell up to your hip and squeeze your shoulder blade.',
    pose: {
      head: [146, 86], spine: [[136, 92], [88, 104]],
      armsF: [[134, 95, 142, 90, 137, 104]], armsB: [[131, 95, 139, 90, 134, 104]],
      legsF: [[88, 104, 106, 136, 112, 164]], legsB: [[88, 104, 72, 134, 62, 164]],
      kb: [138, 118],
      arrows: [{ from: [152, 152], ctrl: [158, 134], to: [151, 124] }]
    }
  },
  {
    id: 'clean-press', name: 'Clean & Press', groups: ['full', 'upper'], level: 2,
    cue: 'Catch in the rack with your elbow high, then press straight overhead.',
    pose: {
      head: [105, 52], spine: [[104, 63], [102, 108]],
      armsF: [[106, 67, 114, 90, 109, 72]], armsB: [[101, 67, 94, 84, 103, 88]],
      legsF: [[102, 108, 107, 136, 105, 164]], legsB: [[102, 108, 97, 136, 93, 164]],
      kb: [105, 82],
      arrows: [{ from: [112, 74], ctrl: [132, 44], to: [116, 24] }]
    }
  },
  {
    id: 'thruster', name: 'Squat to Press', groups: ['full', 'lower', 'upper'], level: 2,
    cue: 'Drive out of the bottom of the squat and press as you stand — one smooth push.',
    pose: {
      head: [106, 74], spine: [[104, 85], [100, 132]],
      armsF: [[105, 89, 109, 56, 110, 34]], armsB: [[101, 89, 94, 104, 102, 108]],
      legsF: [[100, 132, 124, 142, 120, 164]], legsB: [[100, 132, 90, 146, 82, 164]],
      kb: [111, 22],
      arrows: [{ from: [122, 112], ctrl: [140, 72], to: [124, 30] }]
    }
  },
  {
    id: 'overhead-carry', name: 'Overhead Carry', groups: ['upper', 'full'], level: 1,
    cue: 'Lock out, ribs down, walk tall. Pack your shoulders and don’t let the bell drift.',
    pose: {
      head: [106, 52], spine: [[104, 63], [101, 108]],
      armsF: [[105, 67, 108, 42, 109, 30]], armsB: [[99, 67, 95, 90, 94, 112]],
      legsF: [[101, 108, 112, 136, 118, 164]], legsB: [[101, 108, 92, 138, 84, 164]],
      kb: [110, 18],
      arrows: [{ from: [56, 154], ctrl: [112, 148], to: [168, 154] }]
    }
  },
  {
    id: 'deadlift', name: 'Kettlebell Deadlift', groups: ['lower', 'full'], level: 1,
    cue: 'Push your hips back over the bell, then drive up tall. Keep that path straight.',
    pose: {
      head: [137, 78], spine: [[128, 84], [94, 106]],
      armsF: [[126, 87, 130, 115, 131, 143]], armsB: [[123, 87, 127, 115, 128, 143]],
      legsF: [[94, 106, 108, 136, 114, 164]], legsB: [[94, 106, 78, 134, 70, 164]],
      kb: [130, 151],
      arrows: [{ from: [148, 152], ctrl: [154, 122], to: [149, 98] }]
    }
  },

  // ---------------- LOWER BODY ----------------
  {
    id: 'goblet-squat', name: 'Goblet Squat', groups: ['lower'], level: 1,
    cue: 'Elbows inside your knees, sit between your heels, drive up through mid-foot.',
    pose: {
      head: [106, 70], spine: [[104, 81], [100, 132]],
      armsF: [[104, 86, 116, 104, 112, 114]], armsB: [[101, 86, 110, 106, 107, 116]],
      legsF: [[100, 132, 124, 142, 120, 164]], legsB: [[100, 132, 90, 146, 82, 164]],
      kb: [112, 105]
    }
  },
  {
    id: 'split-squat', name: 'Split Squat', groups: ['lower'], level: 2,
    cue: 'Both knees at 90°, torso tall. Drive hard through the front heel.',
    pose: {
      head: [104, 58], spine: [[102, 69], [98, 112]],
      armsF: [[102, 74, 114, 92, 110, 102]], armsB: [[99, 74, 108, 94, 105, 104]],
      legsF: [[98, 112, 124, 134, 122, 164]], legsB: [[98, 112, 78, 150, 66, 164]],
      kb: [110, 93]
    }
  },
  {
    id: 'lunge', name: 'Walking Lunge', groups: ['lower'], level: 1,
    cue: 'Step forward and sink until both knees hit 90°. Keep that chest proud.',
    pose: {
      head: [106, 58], spine: [[104, 69], [100, 118]],
      armsF: [[104, 74, 116, 92, 112, 102]], armsB: [[101, 74, 110, 94, 107, 104]],
      legsF: [[100, 118, 128, 140, 126, 164]], legsB: [[100, 118, 74, 144, 58, 164]],
      kb: [112, 93]
    }
  },
  {
    id: 'step-up', name: 'Step-Up', groups: ['lower'], level: 1,
    cue: 'Drive through the top foot — don’t push off the floor with your back leg.',
    pose: {
      head: [102, 56], spine: [[100, 67], [96, 110]],
      armsF: [[100, 72, 112, 90, 108, 100]], armsB: [[97, 72, 106, 92, 103, 102]],
      legsF: [[96, 110, 124, 122, 142, 138]], legsB: [[96, 110, 78, 142, 66, 164]],
      kb: [108, 91],
      box: { x: 128, y: 138, w: 56, h: 26 }
    }
  },
  {
    id: 'lateral-lunge', name: 'Lateral Lunge', groups: ['lower'], level: 2,
    cue: 'Slide into the side with your knee over your ankle and sit low. Push hips back to center.',
    pose: {
      head: [104, 58], spine: [[102, 69], [99, 126]],
      armsF: [[102, 74, 114, 92, 110, 102]], armsB: [[99, 74, 108, 94, 105, 104]],
      legsF: [[99, 126, 120, 144, 118, 164]], legsB: [[99, 126, 74, 150, 56, 164]],
      kb: [110, 93]
    }
  },

  // ---------------- UPPER BODY ----------------
  {
    id: 'press', name: 'Overhead Press', groups: ['upper'], level: 2,
    cue: 'Elbow in line with your shoulder, no rib flare. Lock it out right over your ear.',
    pose: {
      head: [105, 52], spine: [[104, 63], [102, 108]],
      armsF: [[106, 67, 110, 42, 111, 30]], armsB: [[101, 67, 94, 84, 103, 88]],
      legsF: [[102, 108, 107, 136, 105, 164]], legsB: [[102, 108, 97, 136, 93, 164]],
      kb: [112, 18]
    }
  },
  {
    id: 'floor-press', name: 'Floor Press', groups: ['upper'], level: 1,
    cue: 'Shoulder blades down and back — press straight up until your elbows lock.',
    pose: {
      head: [36, 152], spine: [[47, 154], [92, 156]],
      armsF: [[52, 153, 58, 120, 60, 94]], armsB: [[50, 154, 54, 124, 58, 98]],
      legsF: [[92, 156, 114, 120, 114, 164]], legsB: [[92, 156, 108, 126, 106, 164]],
      kb: [60, 82],
      arrows: [{ from: [74, 150], ctrl: [82, 112], to: [76, 84] }]
    }
  },
  {
    id: 'pushup-kb', name: 'Push-Up on KBs', groups: ['upper'], level: 2,
    cue: 'Body in a straight line — let the extra range of motion work your shoulders and chest.',
    pose: {
      head: [152, 108], spine: [[138, 116], [92, 138]],
      armsF: [[136, 118, 140, 140, 141, 147]], armsB: [[132, 120, 126, 144, 122, 158]],
      legsF: [[92, 138, 70, 150, 50, 162]], legsB: [[92, 138, 64, 154, 44, 163]],
      kb: [142, 151]
    }
  },
  {
    id: 'plank-press', name: 'Plank Press', groups: ['upper', 'core'], level: 2,
    cue: 'Hips stay level with your shoulder — no dropping. Press to a full lockout.',
    pose: {
      head: [150, 110], spine: [[136, 118], [90, 140]],
      armsF: [[134, 120, 146, 96, 152, 72]], armsB: [[130, 122, 126, 144, 124, 158]],
      legsF: [[90, 140, 68, 152, 48, 162]], legsB: [[90, 140, 62, 156, 42, 163]],
      kb: [154, 60],
      arrows: [{ from: [130, 152], ctrl: [144, 118], to: [156, 76] }]
    }
  },
  {
    id: 'bent-row', name: 'Bent-Over Row', groups: ['upper'], level: 1,
    cue: 'Flat back in a hinge position. Pull the bell to your hip and control it down.',
    pose: {
      head: [148, 88], spine: [[138, 94], [92, 104]],
      armsF: [[136, 95, 140, 118, 141, 142]], armsB: [[133, 95, 137, 118, 138, 142]],
      legsF: [[92, 104, 106, 136, 112, 164]], legsB: [[92, 104, 76, 134, 66, 164]],
      kb: [141, 151],
      arrows: [{ from: [154, 150], ctrl: [160, 132], to: [153, 116] }]
    }
  },
  {
    id: 'halo', name: 'Halo', groups: ['upper'], level: 1,
    cue: 'Slow and controlled — smooth circles around your head, both directions.',
    pose: {
      head: [105, 52], spine: [[104, 63], [102, 108]],
      armsF: [[106, 67, 116, 58, 119, 46]], armsB: [[101, 67, 108, 56, 113, 44]],
      legsF: [[102, 108, 107, 136, 105, 164]], legsB: [[102, 108, 97, 136, 93, 164]],
      kb: [121, 42],
      arrows: [{ d: 'M 137 58 A 33 33 0 1 1 135 45', headAngle: -55 }]
    }
  },

  // ---------------- CORE ----------------
  {
    id: 'suitcase-carry', name: 'Suitcase Carry', groups: ['core'], level: 1,
    cue: 'Walk tall right next to the load — resist leaning into it.',
    pose: {
      head: [108, 54], spine: [[106, 65], [102, 110]],
      armsF: [[107, 69, 112, 94, 113, 118]], armsB: [[100, 69, 95, 92, 93, 114]],
      legsF: [[102, 110, 113, 137, 119, 164]], legsB: [[102, 110, 93, 138, 85, 164]],
      kb: [113, 132],
      arrows: [{ from: [56, 154], ctrl: [112, 148], to: [168, 154] }]
    }
  },
  {
    id: 'windmill', name: 'Windmill', groups: ['core'], level: 2,
    cue: 'Deep lunge with one arm long over your body. Don’t let your hips rotate.',
    pose: {
      head: [134, 92], spine: [[128, 98], [98, 130]],
      armsF: [[126, 100, 138, 72, 136, 44]], armsB: [[124, 102, 140, 132, 147, 158]],
      legsF: [[98, 130, 126, 144, 134, 164]], legsB: [[98, 130, 80, 150, 74, 164]],
      kb: null,
      arrows: [{ from: [154, 92], ctrl: [152, 42], to: [118, 36] }]
    }
  },
  {
    id: 'rack-carry', name: 'Front Rack Carry', groups: ['core'], level: 1,
    cue: 'Elbow high and core braced — walk without letting the bell swing on you.',
    pose: {
      head: [105, 52], spine: [[104, 63], [102, 108]],
      armsF: [[106, 67, 114, 90, 109, 72]], armsB: [[100, 67, 95, 92, 93, 114]],
      legsF: [[102, 108, 113, 136, 119, 164]], legsB: [[102, 108, 93, 138, 85, 164]],
      kb: [105, 82],
      arrows: [{ from: [56, 154], ctrl: [112, 148], to: [168, 154] }]
    }
  },
  {
    id: 'russian-twist', name: 'Russian Twist', groups: ['core'], level: 2,
    cue: 'Hinge back about 45° and keep your chest tall. Rotate with your ribs, not your arms.',
    pose: {
      head: [68, 94], spine: [[76, 104], [92, 150]],
      armsF: [[78, 108, 94, 122, 106, 128]], armsB: [[75, 108, 90, 124, 103, 130]],
      legsF: [[92, 150, 122, 134, 132, 162]], legsB: [[92, 150, 116, 140, 126, 162]],
      kb: [114, 128],
      arrows: [{ d: 'M 130 138 A 27 11 0 1 1 95 140', headAngle: 25 }]
    }
  },
  {
    id: 'plank-pass', name: 'Plank Bell Pass', groups: ['core', 'upper'], level: 2,
    cue: 'Hold a steady plank and pass the bell under your body in one smooth arc.',
    pose: {
      head: [150, 110], spine: [[136, 118], [90, 140]],
      armsF: [[132, 120, 128, 144, 126, 158]], armsB: [[138, 117, 142, 96, 140, 80]],
      legsF: [[90, 140, 68, 152, 48, 162]], legsB: [[90, 140, 62, 156, 42, 163]],
      kb: [141, 68],
      arrows: [{ from: [148, 74], ctrl: [90, 192], to: [30, 120] }]
    }
  }
];

const GROUPS = [
  { id: 'full', label: 'Full Body' },
  { id: 'upper', label: 'Upper Body' },
  { id: 'lower', label: 'Lower Body' },
  { id: 'core', label: 'Core' }
];

const LEVELS = [
  { id: 0, label: 'All levels' },
  { id: 1, label: 'Beginner' },
  { id: 2, label: 'Intermediate' },
  { id: 3, label: 'Advanced' }
];
