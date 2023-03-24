# Albatross Monkey Chaos

Albatross Monkey Chaos is a tool that simulates events happening to a set of validators. It randomly performs a set of actions such as deactivating, reactivating, creating, or deleting validators. This tool is useful for testing and simulating real-life scenarios where validators could face different types of issues.

## Requirements

- Node.js 16.x or higher
- A local devnet running on the latest version of the [Albatross branch](https://github.com/nimiq/core-rs-albatross). Both projects should be in the same folder as shown here:

```
your-folder
├── core-rs-albatross
└── albatross-monkey-chaos
```

## Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/monkey-chaos.git
cd monkey-chaos
yarn install
```

## Usage

### Configuration

Edit configuration in [main.ts](./src/main.ts) file.

### Running the tool

```bash
yarn chaos
```

## Example Output

An example output of the Monkey Chaos tool will look like:

```
🐒  Starting Monkey Chaos...
🐵  It will run 60 in intervals of 2s times with the following probabilities:
┌─────────┬──────────────┬─────────────┐
│ (index) │    action    │ probability │
├─────────┼──────────────┼─────────────┤
│    0    │ 'deactivate' │  '45.00%'   │
│    1    │ 'reactivate' │  '45.00%'   │
│    2    │   'create'   │   '5.00%'   │
│    3    │   'delete'   │   '5.00%'   │
└─────────┴──────────────┴─────────────┘
🐵  With the validators from the genesis file:
┌─────────┬────────────────────────────────────────────────┬────────┐
│ (index) │                    address                     │ active │
├─────────┼────────────────────────────────────────────────┼────────┤
│    0    │ 'NQ86 GSTD MFGN E3X4 0KGU 4PJU D2AQ P946 L4RV' │  true  │
│    1    │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │  true  │
│    2    │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │  true  │
│    3    │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  true  │
└─────────┴────────────────────────────────────────────────┴────────┘
🙊  Monkey chose to delete validator NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD (59)
        ✅  Success
🙈  Sleeping for 2 seconds...
🙊  Monkey chose to delete validator NQ86 GSTD MFGN E3X4 0KGU 4PJU D2AQ P946 L4RV (58)
        ✅  Success
🙈  Sleeping for 2 seconds...

...

🙊  Monkey chose to deactivate validator NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX (2)
        ✅  Success
🙈  Sleeping for 2 seconds...
🙊  Monkey chose to delete validator NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD (1)
        ✅  Success
🙈  Sleeping for 2 seconds...
🙈  Sleeping for 2 seconds...
🐒  Monkey Chaos finished...
📝  Report:
┌─────────┬────────┬──────────────┬────────────────────────────────────────────────┬───────┬────────────────┬────────────────────────────────┐
│ (index) │ output │    action    │                   validator                    │ block │      time      │              meta              │
├─────────┼────────┼──────────────┼────────────────────────────────────────────────┼───────┼────────────────┼────────────────────────────────┤
│    0    │  '✅'  │   'delete'   │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │  408  │ '12:17:28:316' │               ''               │
│    1    │  '✅'  │   'delete'   │ 'NQ86 GSTD MFGN E3X4 0KGU 4PJU D2AQ P946 L4RV' │  410  │ '12:17:30:374' │               ''               │
│    2    │  '✅'  │   'delete'   │ 'NQ86 GSTD MFGN E3X4 0KGU 4PJU D2AQ P946 L4RV' │  412  │ '12:17:32:389' │               ''               │
│    3    │  '✅'  │ 'deactivate' │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │  414  │ '12:17:34:413' │               ''               │
│    4    │  '❌'  │   'create'   │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  525  │ '12:19:25:162' │ 'Validator balance is too low' │
│    5    │  '❌'  │   'create'   │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  537  │ '12:19:37:179' │ 'Validator balance is too low' │
│    6    │  '✅'  │   'delete'   │ 'NQ86 GSTD MFGN E3X4 0KGU 4PJU D2AQ P946 L4RV' │  539  │ '12:19:39:195' │               ''               │
│    7    │  '✅'  │   'delete'   │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  541  │ '12:19:41:210' │               ''               │
│    8    │  '✅'  │ 'reactivate' │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │  543  │ '12:19:43:226' │               ''               │
│    9    │  '✅'  │ 'deactivate' │ 'NQ86 GSTD MFGN E3X4 0KGU 4PJU D2AQ P946 L4RV' │  545  │ '12:19:45:242' │               ''               │
│   10    │  '✅'  │   'delete'   │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │  547  │ '12:19:47:257' │               ''               │
│   11    │  '❌'  │   'create'   │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  558  │ '12:19:58:299' │ 'Validator balance is too low' │
│   12    │  '✅'  │ 'deactivate' │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  560  │ '12:20:00:315' │               ''               │
│   13    │  '✅'  │ 'deactivate' │ 'NQ86 GSTD MFGN E3X4 0KGU 4PJU D2AQ P946 L4RV' │  562  │ '12:20:02:335' │               ''               │
│   14    │  '✅'  │ 'reactivate' │ 'NQ86 GSTD MFGN E3X4 0KGU 4PJU D2AQ P946 L4RV' │  564  │ '12:20:04:352' │               ''               │
│   15    │  '✅'  │   'delete'   │ 'NQ86 GSTD MFGN E3X4 0KGU 4PJU D2AQ P946 L4RV' │  566  │ '12:20:06:370' │               ''               │
│   16    │  '❌'  │   'create'   │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  576  │ '12:20:16:229' │ 'Validator balance is too low' │
│   17    │  '❌'  │   'create'   │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  586  │ '12:20:26:227' │ 'Validator balance is too low' │
│   18    │  '✅'  │ 'reactivate' │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  588  │ '12:20:28:240' │               ''               │
│   19    │  '❌'  │   'create'   │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  598  │ '12:20:38:251' │ 'Validator balance is too low' │
│   20    │  '✅'  │ 'deactivate' │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  599  │ '12:20:40:265' │               ''               │
│   21    │  '✅'  │   'delete'   │ 'NQ86 GSTD MFGN E3X4 0KGU 4PJU D2AQ P946 L4RV' │  602  │ '12:20:42:286' │               ''               │
│   22    │  '✅'  │   'delete'   │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │  604  │ '12:20:44:301' │               ''               │
│   23    │  '✅'  │   'delete'   │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │  606  │ '12:20:46:315' │               ''               │
│   24    │  '✅'  │ 'deactivate' │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  608  │ '12:20:48:339' │               ''               │
│   25    │  '✅'  │   'delete'   │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │  610  │ '12:20:50:362' │               ''               │
│   26    │  '✅'  │ 'deactivate' │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │  612  │ '12:20:52:381' │               ''               │
│   27    │  '❌'  │   'create'   │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  622  │ '12:21:02:271' │ 'Validator balance is too low' │
│   28    │  '✅'  │ 'reactivate' │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │  624  │ '12:21:04:287' │               ''               │
│   29    │  '❌'  │   'create'   │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  634  │ '12:21:14:276' │ 'Validator balance is too low' │
│   30    │  '✅'  │ 'reactivate' │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │  636  │ '12:21:16:293' │               ''               │
│   31    │  '✅'  │ 'deactivate' │ 'NQ86 GSTD MFGN E3X4 0KGU 4PJU D2AQ P946 L4RV' │  638  │ '12:21:18:308' │               ''               │
│   32    │  '✅'  │   'delete'   │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  640  │ '12:21:20:325' │               ''               │
│   33    │  '❌'  │   'create'   │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  650  │ '12:21:30:268' │ 'Validator balance is too low' │
│   34    │  '❌'  │   'create'   │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  661  │ '12:21:41:304' │ 'Validator balance is too low' │
│   35    │  '✅'  │ 'deactivate' │ 'NQ86 GSTD MFGN E3X4 0KGU 4PJU D2AQ P946 L4RV' │  663  │ '12:21:43:320' │               ''               │
│   36    │  '✅'  │ 'reactivate' │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │  665  │ '12:21:45:335' │               ''               │
│   37    │  '✅'  │ 'deactivate' │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │  667  │ '12:21:47:351' │               ''               │
│   38    │  '✅'  │   'delete'   │ 'NQ86 GSTD MFGN E3X4 0KGU 4PJU D2AQ P946 L4RV' │  669  │ '12:21:49:366' │               ''               │
│   39    │  '✅'  │   'delete'   │ 'NQ86 GSTD MFGN E3X4 0KGU 4PJU D2AQ P946 L4RV' │  671  │ '12:21:51:380' │               ''               │
│   40    │  '✅'  │ 'reactivate' │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  673  │ '12:21:53:397' │               ''               │
│   41    │  '✅'  │ 'deactivate' │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │  675  │ '12:21:55:415' │               ''               │
│   42    │  '✅'  │   'delete'   │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │  677  │ '12:21:57:432' │               ''               │
│   43    │  '❌'  │   'create'   │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  687  │ '12:22:07:286' │ 'Validator balance is too low' │
│   44    │  '✅'  │ 'reactivate' │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │  689  │ '12:22:09:302' │               ''               │
│   45    │  '✅'  │   'delete'   │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │  691  │ '12:22:11:316' │               ''               │
│   46    │  '✅'  │ 'deactivate' │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │  693  │ '12:22:13:331' │               ''               │
│   47    │  '✅'  │ 'reactivate' │ 'NQ86 GSTD MFGN E3X4 0KGU 4PJU D2AQ P946 L4RV' │  695  │ '12:22:15:345' │               ''               │
│   48    │  '✅'  │ 'deactivate' │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │  697  │ '12:22:17:360' │               ''               │
│   49    │  '✅'  │   'delete'   │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │  699  │ '12:22:19:374' │               ''               │
│   50    │  '✅'  │ 'reactivate' │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │  701  │ '12:22:21:387' │               ''               │
│   51    │  '✅'  │ 'deactivate' │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │  703  │ '12:22:23:403' │               ''               │
│   52    │  '✅'  │ 'reactivate' │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │  705  │ '12:22:25:418' │               ''               │
│   53    │  '✅'  │ 'deactivate' │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │  707  │ '12:22:27:433' │               ''               │
│   54    │  '✅'  │ 'deactivate' │ 'NQ86 GSTD MFGN E3X4 0KGU 4PJU D2AQ P946 L4RV' │  709  │ '12:22:29:447' │               ''               │
│   55    │  '✅'  │ 'deactivate' │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │  711  │ '12:22:31:462' │               ''               │
│   56    │  '✅'  │   'delete'   │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │  713  │ '12:22:33:477' │               ''               │
│   57    │  '✅'  │ 'deactivate' │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │  715  │ '12:22:35:491' │               ''               │
│   58    │  '✅'  │   'delete'   │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │  717  │ '12:22:37:505' │               ''               │
│   59    │  '❌'  │   'create'   │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │  727  │ '12:22:47:313' │ 'Validator balance is too low' │
└─────────┴────────┴──────────────┴────────────────────────────────────────────────┴───────┴────────────────┴────────────────────────────────┘
```