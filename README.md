# Albatross Monkey Chaos

Albatross Monkey Chaos is a tool that simulates events happening to a set of validators. It randomly performs a set of actions such as deactivating, reactivating, creating, or deleting validators. This tool is useful for testing and simulating real-life scenarios where validators could face different types of issues.

> **Warning**
> This is tool is very primitive and may cause unexpected behavior. Use at your own risk.

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

Edit configuration in [config.ts](./src/config/config.yaml) file.

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
🙊  Monkey chose to deactivate validator NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX (59)
        ✅  Success
🙈  Sleeping for 2 seconds...
🙊  Monkey chose to create validator (58)
        ✅  Success
🙈  Sleeping for 2 seconds...

...

🙊  Monkey chose to delete validator NQ21 BKRX F5EC VJVL CYGA C8UJ L81Q CEYC RDXK (2)
        ✅  Success
🙈  Sleeping for 2 seconds...
🙊  Monkey chose to deactivate validator NQ73 VMAG 23H6 8SQJ C71X CALG 69HL BRGV PVRX (1)
        ✅  Success
🙈  Sleeping for 2 seconds...
🐒  Monkey Chaos finished...
📝  Report:
┌─────────┬────────┬──────────────┬────────────────────────────────────────────────┬───────┬────────────────┬───────┐
│ (index) │ sucess │    action    │                   validator                    │ block │      time      │ error │
├─────────┼────────┼──────────────┼────────────────────────────────────────────────┼───────┼────────────────┼───────┤
│    0    │  '✅'  │ 'deactivate' │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │ 2072  │ '12:45:13:028' │  ''   │
│    1    │  '✅'  │   'create'   │ 'NQ21 Q484 674V YXJ2 JUKD D3T4 BX87 2T0M 2PYV' │ 2081  │ '12:45:22:142' │  ''   │
│    2    │  '✅'  │ 'reactivate' │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │ 2083  │ '12:45:24:157' │  ''   │
│    3    │  '✅'  │   'create'   │ 'NQ08 467T 0E7D HT9D GG3C S1TU CS3P LXGB TFXG' │ 2092  │ '12:45:33:417' │  ''   │
│    4    │  '✅'  │ 'deactivate' │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │ 2094  │ '12:45:35:433' │  ''   │
│    5    │  '✅'  │   'create'   │ 'NQ60 AMD1 EUVS J7F9 2ERX YJHD BA2V 8GV1 6AXN' │ 2104  │ '12:45:44:897' │  ''   │
│    6    │  '✅'  │   'delete'   │ 'NQ86 GSTD MFGN E3X4 0KGU 4PJU D2AQ P946 L4RV' │ 2106  │ '12:45:46:914' │  ''   │
│    7    │  '✅'  │ 'deactivate' │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │ 2108  │ '12:45:48:931' │  ''   │
│    8    │  '✅'  │ 'deactivate' │ 'NQ60 AMD1 EUVS J7F9 2ERX YJHD BA2V 8GV1 6AXN' │ 2110  │ '12:45:50:946' │  ''   │
│    9    │  '✅'  │ 'deactivate' │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │ 2112  │ '12:45:52:964' │  ''   │
│   10    │  '✅'  │ 'reactivate' │ 'NQ60 AMD1 EUVS J7F9 2ERX YJHD BA2V 8GV1 6AXN' │ 2114  │ '12:45:54:991' │  ''   │
│   11    │  '✅'  │   'create'   │ 'NQ44 RL1B Y4UB 3VD8 0RDU 8RGK AXKS 3VNL K2D9' │ 2123  │ '12:46:04:214' │  ''   │
│   12    │  '✅'  │ 'deactivate' │ 'NQ44 RL1B Y4UB 3VD8 0RDU 8RGK AXKS 3VNL K2D9' │ 2125  │ '12:46:06:232' │  ''   │
│   13    │  '✅'  │ 'deactivate' │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │ 2127  │ '12:46:08:250' │  ''   │
│   14    │  '✅'  │   'create'   │ 'NQ95 6K94 ST55 BMY3 H6PD S4D5 N3CM AEP4 ET8L' │ 2136  │ '12:46:17:461' │  ''   │
│   15    │  '✅'  │ 'deactivate' │ 'NQ44 RL1B Y4UB 3VD8 0RDU 8RGK AXKS 3VNL K2D9' │ 2138  │ '12:46:19:475' │  ''   │
│   16    │  '✅'  │ 'reactivate' │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │ 2140  │ '12:46:21:495' │  ''   │
│   17    │  '✅'  │ 'deactivate' │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │ 2142  │ '12:46:23:517' │  ''   │
│   18    │  '✅'  │   'delete'   │ 'NQ21 Q484 674V YXJ2 JUKD D3T4 BX87 2T0M 2PYV' │ 2144  │ '12:46:25:532' │  ''   │
│   19    │  '✅'  │ 'reactivate' │ 'NQ95 6K94 ST55 BMY3 H6PD S4D5 N3CM AEP4 ET8L' │ 2146  │ '12:46:27:554' │  ''   │
│   20    │  '✅'  │ 'reactivate' │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │ 2148  │ '12:46:29:589' │  ''   │
│   21    │  '✅'  │   'create'   │ 'NQ17 PYMP 6NNQ 8KJN 30JG LQFB DV37 LV2H RFNF' │ 2158  │ '12:46:38:987' │  ''   │
│   22    │  '✅'  │   'create'   │ 'NQ27 93XL 695C F25U 62FY 3GJ4 UFBM L6U7 T3CJ' │ 2167  │ '12:46:48:243' │  ''   │
│   23    │  '✅'  │   'create'   │ 'NQ90 ABTL 4H91 PRJ9 NRAB PYQK KRMH S120 G59P' │ 2176  │ '12:46:57:560' │  ''   │
│   24    │  '✅'  │ 'reactivate' │ 'NQ60 AMD1 EUVS J7F9 2ERX YJHD BA2V 8GV1 6AXN' │ 2178  │ '12:46:59:575' │  ''   │
│   25    │  '✅'  │   'create'   │ 'NQ82 1FN1 V0YL BYHM DV3X 8X3H UN7G 294G KQR8' │ 2188  │ '12:47:09:276' │  ''   │
│   26    │  '✅'  │   'create'   │ 'NQ73 VMAG 23H6 8SQJ C71X CALG 69HL BRGV PVRX' │ 2197  │ '12:47:18:515' │  ''   │
│   27    │  '✅'  │   'delete'   │ 'NQ27 93XL 695C F25U 62FY 3GJ4 UFBM L6U7 T3CJ' │ 2199  │ '12:47:20:533' │  ''   │
│   28    │  '✅'  │   'delete'   │ 'NQ08 467T 0E7D HT9D GG3C S1TU CS3P LXGB TFXG' │ 2201  │ '12:47:22:557' │  ''   │
│   29    │  '✅'  │   'delete'   │ 'NQ49 QD4P 1TPH KGSN ES16 ADL7 AC27 K7YE B8RB' │ 2203  │ '12:47:24:583' │  ''   │
│   30    │  '✅'  │ 'deactivate' │ 'NQ82 1FN1 V0YL BYHM DV3X 8X3H UN7G 294G KQR8' │ 2205  │ '12:47:26:603' │  ''   │
│   31    │  '✅'  │ 'deactivate' │ 'NQ90 ABTL 4H91 PRJ9 NRAB PYQK KRMH S120 G59P' │ 2207  │ '12:47:28:619' │  ''   │
│   32    │  '✅'  │ 'deactivate' │ 'NQ60 AMD1 EUVS J7F9 2ERX YJHD BA2V 8GV1 6AXN' │ 2209  │ '12:47:30:635' │  ''   │
│   33    │  '✅'  │ 'reactivate' │ 'NQ73 VMAG 23H6 8SQJ C71X CALG 69HL BRGV PVRX' │ 2211  │ '12:47:32:653' │  ''   │
│   34    │  '✅'  │ 'deactivate' │ 'NQ17 PYMP 6NNQ 8KJN 30JG LQFB DV37 LV2H RFNF' │ 2213  │ '12:47:34:669' │  ''   │
│   35    │  '✅'  │   'delete'   │ 'NQ95 6K94 ST55 BMY3 H6PD S4D5 N3CM AEP4 ET8L' │ 2215  │ '12:47:36:683' │  ''   │
│   36    │  '✅'  │ 'deactivate' │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │ 2217  │ '12:47:38:697' │  ''   │
│   37    │  '✅'  │ 'reactivate' │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │ 2219  │ '12:47:40:712' │  ''   │
│   38    │  '✅'  │   'create'   │ 'NQ78 QXRA 71NY 0T3B VJV2 QPHG 7VY1 6V8T 29J7' │ 2228  │ '12:47:49:809' │  ''   │
│   39    │  '✅'  │   'create'   │ 'NQ15 FXNK L5D0 20NV 6G7M BXJX 52GM UH0Y YNYN' │ 2237  │ '12:47:58:833' │  ''   │
│   40    │  '✅'  │ 'reactivate' │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │ 2240  │ '12:48:00:848' │  ''   │
│   41    │  '✅'  │   'create'   │ 'NQ31 X4AE LVJM XSJB XFLK 8UAA EB6G P900 4RU7' │ 2248  │ '12:48:09:788' │  ''   │
│   42    │  '✅'  │   'delete'   │ 'NQ90 ABTL 4H91 PRJ9 NRAB PYQK KRMH S120 G59P' │ 2250  │ '12:48:11:803' │  ''   │
│   43    │  '✅'  │   'delete'   │ 'NQ31 X4AE LVJM XSJB XFLK 8UAA EB6G P900 4RU7' │ 2252  │ '12:48:13:819' │  ''   │
│   44    │  '✅'  │   'delete'   │ 'NQ92 HXM6 XR1B 8J8S TGHF BY75 GPMV 3LMR G5TD' │ 2255  │ '12:48:15:835' │  ''   │
│   45    │  '✅'  │   'delete'   │ 'NQ82 1FN1 V0YL BYHM DV3X 8X3H UN7G 294G KQR8' │ 2257  │ '12:48:17:850' │  ''   │
│   46    │  '✅'  │ 'deactivate' │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │ 2259  │ '12:48:19:863' │  ''   │
│   47    │  '✅'  │   'create'   │ 'NQ40 JDM5 B8BB 0HB9 5FUP 04HB 3VP0 AJNG PB1E' │ 2267  │ '12:48:28:840' │  ''   │
│   48    │  '✅'  │   'delete'   │ 'NQ15 FXNK L5D0 20NV 6G7M BXJX 52GM UH0Y YNYN' │ 2270  │ '12:48:30:853' │  ''   │
│   49    │  '✅'  │ 'reactivate' │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │ 2272  │ '12:48:32:867' │  ''   │
│   50    │  '✅'  │   'delete'   │ 'NQ78 QXRA 71NY 0T3B VJV2 QPHG 7VY1 6V8T 29J7' │ 2274  │ '12:48:34:882' │  ''   │
│   51    │  '✅'  │   'delete'   │ 'NQ17 PYMP 6NNQ 8KJN 30JG LQFB DV37 LV2H RFNF' │ 2276  │ '12:48:36:897' │  ''   │
│   52    │  '✅'  │   'delete'   │ 'NQ34 8U3V K8JT VQLA CF3E K081 GQGJ RYEA NCDX' │ 2278  │ '12:48:38:911' │  ''   │
│   53    │  '✅'  │ 'deactivate' │ 'NQ60 AMD1 EUVS J7F9 2ERX YJHD BA2V 8GV1 6AXN' │ 2280  │ '12:48:40:926' │  ''   │
│   54    │  '✅'  │   'create'   │ 'NQ21 BKRX F5EC VJVL CYGA C8UJ L81Q CEYC RDXK' │ 2289  │ '12:48:49:920' │  ''   │
│   55    │  '✅'  │   'create'   │ 'NQ85 8844 29LD V31X 7NKS PSG3 P64C 7QFP N155' │ 2298  │ '12:48:59:182' │  ''   │
│   56    │  '✅'  │   'delete'   │ 'NQ44 RL1B Y4UB 3VD8 0RDU 8RGK AXKS 3VNL K2D9' │ 2300  │ '12:49:01:196' │  ''   │
│   57    │  '✅'  │   'create'   │ 'NQ17 7ELL Q5D0 AXGV 2127 HUR7 HTTC 8VH4 8D84' │ 2309  │ '12:49:10:215' │  ''   │
│   58    │  '✅'  │   'delete'   │ 'NQ21 BKRX F5EC VJVL CYGA C8UJ L81Q CEYC RDXK' │ 2311  │ '12:49:12:227' │  ''   │
│   59    │  '✅'  │ 'deactivate' │ 'NQ73 VMAG 23H6 8SQJ C71X CALG 69HL BRGV PVRX' │ 2313  │ '12:49:14:244' │  ''   │
└─────────┴────────┴──────────────┴────────────────────────────────────────────────┴───────┴────────────────┴───────┘
```