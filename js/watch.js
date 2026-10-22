/* Ferraro Atelier — desenho do relógio em SVG e o "movimento" que faz os ponteiros andarem.
   Tudo é desenhado a partir de um objeto de configuração (veja DEFAULT_WATCH). */

const DEFAULT_WATCH = {
  caseShape: "redonda",      // redonda | almofada | octogonal
  size: 40,
  caseColor: "#c9cdd2",
  dialColor: "#1f4f8c",
  dialFume: true,
  dialFinish: "raios",       // liso | raios | listrado | texturizado | grade
  dialLayout: "data",        // data | sem-data | crono
  indexStyle: "bastao",      // bastao | romanos | arabicos | pontos
  indexColor: "#e9ecef",
  subdialColor: "#d9dad6",
  lume: true,
  handStyle: "espada",
  handColor: "#e6e9ee",
  secondStyle: "agulha",     // agulha | pirulito | seta
  secondColor: "#3fc1c9",
  bezelType: "mergulho",     // mergulho | taquimetro | lisa | canelada
  bezelColor: "#1a1d22",
  bezelTwoTone: false,
  bezelColor2: "#a51f2b",
  strapType: "nato",         // nato | couro | borracha | oyster | jubile | integrada
  strapColor: "#1e3a6e",     // pulseiras de tecido, couro e borracha: cor de fora
  strapColor2: "#9b2335",    // cor de dentro (faixa central), quando em duas cores
  braceletColor: "#c9cdd2",  // pulseiras de aço: elos de fora
  braceletColor2: "#d4b062", // elos do centro, quando em duas cores
  strapTwoTone: false,
  stitchColor: "#e8d6c0",
  movement: "automatico",    // quartzo | automatico | manual
  rotorColor: "#3fbfbd",
  swiss: false,              // movimento suíço (Sellita SW200-1 / SW210-1)
  displayBack: true,         // fundo de vidro (só automático e manual)
  skeleton: false,           // mostrador esqueleto (só automático e manual)
  refWatch: "",
  refNotes: "",
};

/** Logo da Ferraro Atelier (as asas), em caixa de 1000 × 207. */
const WINGS_D = "M476 145 432 121 263 184 261 186 285 199 305 205 320 207 340 207 355 205 374 200 405 188 449 164 476 147ZM524 145 568 121 737 184 739 186 715 199 695 205 680 207 660 207 645 205 626 200 595 188 551 164 524 147ZM415 109 388 85 385 85 192 135 191 137 234 168 237 169 415 111ZM585 109 612 85 615 85 808 135 809 137 766 168 763 169 585 111ZM373 68 360 52 347 31 345 30 257 48 110 75 108 76 165 117 169 117 373 69ZM627 68 640 52 653 31 655 30 743 48 890 75 892 76 835 117 831 117 627 69ZM0 0 1 2 72 50 343 25 343 23 334 7 328 2 320 0ZM1000 0 999 2 928 50 657 25 657 23 666 7 672 2 680 0Z";
const WINGS_RATIO = 0.207;

const Watch = (() => {
  const CX = 200;
  const CY = 260;

  /** Logo empilhada (asas, FERRARO, ATELIER) centrada em (x, y), com largura w. */
  const MARK_W = 586.0, MARK_H = 319.0;
  const MARK_INNER = `<g transform="translate(111.3 0) scale(1.1534) translate(-0.0 -167.8)"><path d="M165.1 213.5 166.0 214.9 168.2 215.8 176.8 221.6 186.2 226.6 192.9 229.3 203.7 232.4 210.0 233.3 210.4 232.8 218.9 232.8 225.2 231.0 232.4 227.5 232.4 226.6 223.4 223.4 218.9 221.2 208.2 218.0 205.9 216.7 195.2 213.1 180.3 206.8 177.2 206.8 171.8 210.4ZM149.4 214.0 140.9 209.5 136.4 206.4 135.0 206.4 122.9 211.8 107.2 217.1 96.5 221.6 95.1 221.6 82.5 226.1 81.7 227.0 85.2 229.3 95.1 232.8 104.5 233.3 111.3 232.4 119.8 230.1 127.0 227.5 135.0 223.4 148.9 214.9ZM130.6 202.3 125.6 198.7 122.0 195.2 118.4 194.7 105.4 198.7 94.7 201.0 71.8 207.7 61.9 210.0 60.6 211.3 73.1 220.7 75.8 220.7 82.5 218.0 84.3 218.0 92.0 214.9 104.1 211.3 109.0 209.1 110.4 209.1 127.4 203.2 129.2 203.2ZM184.4 202.3 200.5 207.3 201.9 208.2 203.2 208.2 239.6 220.7 242.3 220.7 254.8 211.3 254.8 210.9 249.0 209.1 247.2 209.1 241.4 206.8 234.2 205.5 223.4 201.9 211.3 199.2 210.0 198.3 202.3 196.9 201.0 196.1 193.4 194.3 189.3 198.7ZM116.2 188.9 111.7 183.0 109.5 178.6 106.8 178.6 95.1 180.3 87.9 182.1 82.5 182.6 75.4 184.4 67.7 185.3 65.5 186.2 55.6 187.5 52.9 188.4 34.5 191.1 33.6 192.0 50.2 203.7 52.9 204.1 67.3 200.1 69.5 200.1 73.6 198.7 84.3 196.9 101.8 192.5 110.8 191.1 115.7 189.8ZM198.7 188.9 200.1 190.2 204.1 190.7 216.7 193.8 218.9 193.8 226.1 196.1 246.3 200.1 248.1 201.0 261.6 204.1 264.2 204.1 280.8 192.0 280.4 191.1 277.7 191.1 275.5 190.2 265.1 188.9 263.3 188.0 260.7 188.0 240.0 183.9 235.1 183.5 228.4 181.7 211.8 179.5 207.3 178.1 205.9 178.1 205.0 179.0 203.2 182.6 201.9 183.9 201.9 184.8ZM0.0 168.2 0.4 169.6 3.6 170.9 21.1 182.6 32.8 182.1 43.1 180.8 48.9 180.8 60.1 179.5 66.4 179.5 70.4 178.6 89.7 177.7 107.2 175.9 107.2 174.5 103.6 168.2ZM314.0 167.8 313.1 168.2 210.4 168.2 206.8 175.4 207.7 176.3 221.2 176.8 226.1 177.7 254.8 179.5 259.8 180.3 277.3 181.2 293.4 183.0 314.5 169.1Z"/></g><g transform="translate(0 117.1) translate(-414.1 -101.4)"><path fill-rule="evenodd" d="M941.7 147.2 940.8 149.4 936.7 153.4 934.5 154.8 934.9 155.7 936.7 156.1 940.3 159.7 941.7 162.4 942.6 162.4 946.2 157.5 949.8 154.8 944.4 150.3 942.6 147.2ZM812.5 102.3 816.1 106.3 817.9 112.6 817.9 184.4 817.4 184.8 817.9 197.4 816.5 202.3 812.5 206.8 812.9 207.3 838.0 207.3 838.5 206.8 835.8 204.1 834.0 201.0 833.6 183.9 834.0 183.5 834.0 171.4 834.9 170.5 840.7 170.9 845.7 173.2 849.7 176.8 855.1 184.8 860.5 196.1 866.3 203.2 871.7 205.9 877.5 207.3 889.6 207.3 890.5 206.8 890.1 205.9 888.7 205.9 886.5 204.6 882.0 200.1 868.6 177.7 864.1 173.2 858.2 169.6 859.1 168.2 865.4 166.0 872.6 160.6 876.2 156.6 880.7 147.6 882.0 138.2 881.6 129.7 878.9 122.0 874.8 115.7 871.7 112.2 866.8 108.6 858.2 104.5 853.3 103.2 850.2 103.2 846.6 102.3ZM835.4 104.1 843.4 104.5 847.0 105.4 853.7 109.0 858.7 114.4 862.7 121.6 865.0 131.9 865.0 143.1 863.2 150.7 860.9 156.1 858.2 159.7 853.3 164.2 847.0 167.3 842.5 168.2 834.9 168.2 834.0 167.3 834.0 115.3 833.6 112.6 834.0 112.2 834.0 105.4ZM640.6 102.3 644.2 106.3 646.0 112.2 646.0 198.3 644.7 202.8 641.1 206.8 641.5 207.3 659.9 207.3 660.4 206.8 666.2 207.3 667.1 206.8 664.0 204.1 662.6 201.4 662.2 198.7 662.2 171.4 663.1 170.5 667.6 170.5 672.1 172.3 677.9 177.2 682.4 183.5 687.8 194.7 690.9 199.2 695.8 204.1 704.4 207.3 717.4 207.3 718.3 206.8 717.8 205.9 715.6 205.0 711.5 201.9 708.8 198.7 700.8 184.4 696.3 178.1 690.4 172.7 684.6 169.6 686.0 168.2 694.5 165.1 699.0 162.0 703.9 156.6 707.9 148.9 709.7 141.3 709.7 130.6 707.0 122.0 703.9 117.5 703.9 116.6 699.4 111.7 694.5 108.1 687.8 105.0 681.9 103.2 676.1 102.3ZM663.1 104.5 672.9 105.0 677.0 106.3 683.7 111.3 688.2 117.1 690.4 121.6 692.7 130.1 693.1 134.1 692.7 144.9 691.3 150.7 688.6 156.6 681.9 164.2 677.0 166.9 671.6 168.2 663.1 168.2 662.2 167.3 662.2 162.9 661.7 162.4 661.7 156.1 662.2 155.7 661.7 109.5 662.2 105.4ZM561.2 102.3 564.4 105.4 565.7 108.1 566.6 112.6 566.6 197.8 566.2 201.0 563.9 204.1 561.2 206.4 562.6 207.3 563.5 206.8 565.7 207.3 581.4 207.3 581.9 206.8 586.8 207.3 587.3 206.8 584.6 204.1 583.2 201.0 582.8 171.4 583.7 170.5 587.7 170.5 594.0 173.2 598.5 176.8 603.4 183.9 609.2 196.1 611.0 198.7 615.1 202.8 623.1 206.8 637.5 207.3 638.0 205.9 633.9 203.7 628.1 196.5 621.8 185.3 616.9 178.1 611.9 173.2 605.7 169.6 606.6 168.2 609.2 167.8 613.3 166.0 619.6 162.0 625.4 155.7 629.4 147.6 630.8 141.3 630.8 130.6 628.1 121.6 625.8 118.0 620.9 112.2 614.6 107.7 603.0 103.2 596.2 102.3ZM586.4 104.1 592.2 104.5 598.0 106.3 600.7 107.7 606.6 112.6 611.9 121.6 611.9 122.9 612.8 124.3 614.2 130.1 614.6 140.4 613.3 147.2 611.5 152.1 608.3 157.9 604.3 162.4 600.7 165.1 595.3 167.3 588.2 168.7 584.1 168.7 582.8 167.3 582.8 105.4 583.7 104.5ZM489.5 102.3 489.0 103.2 491.7 105.4 493.9 110.8 493.9 198.7 493.5 201.4 492.1 203.7 489.0 206.8 489.5 207.3 492.6 206.8 495.3 207.3 496.2 206.8 498.0 207.3 519.5 207.3 520.0 206.8 552.7 207.3 553.6 206.4 554.1 198.7 556.3 187.1 555.9 185.7 555.0 186.2 552.3 192.5 548.2 197.4 542.4 201.9 539.3 203.2 534.3 204.1 532.5 205.0 514.6 205.0 511.9 204.6 510.5 201.9 510.5 157.9 511.4 157.0 520.9 157.0 526.2 158.4 529.8 160.6 532.5 163.3 534.3 166.0 535.2 169.6 536.1 170.0 536.6 169.1 536.1 166.0 536.6 142.2 536.1 141.3 535.2 141.8 532.1 148.5 529.4 151.2 524.5 153.9 520.4 154.8 511.4 154.8 510.5 153.9 510.5 105.4 511.4 104.5 515.0 104.1 515.9 104.5 533.4 104.5 540.2 106.3 546.0 109.9 550.0 114.0 554.1 121.1 554.5 118.9 551.8 102.7 551.4 102.3ZM478.7 102.3 453.1 102.3 452.7 102.7 449.1 102.3 416.3 102.7 415.4 102.3 414.5 102.7 417.2 105.4 419.5 112.6 419.5 198.3 418.6 201.9 417.2 204.1 414.1 206.8 415.0 207.3 416.8 206.8 441.0 207.3 441.0 206.4 437.9 204.6 435.6 199.6 435.6 157.9 436.5 157.0 448.2 157.0 452.2 157.9 457.2 160.6 461.6 165.5 462.1 168.7 463.0 169.1 463.4 166.9 463.0 166.4 463.0 161.5 463.4 161.1 463.4 156.6 463.0 156.1 463.4 144.0 463.0 142.2 462.1 142.7 460.7 147.2 456.7 151.2 452.2 153.9 448.2 154.8 436.5 154.8 435.2 153.4 435.6 152.1 435.2 149.8 435.6 147.6 435.6 121.6 435.2 121.1 435.6 105.4 436.5 104.5 455.8 104.1 465.2 105.9 470.2 108.1 476.9 114.4 481.8 122.5 480.9 112.6ZM762.7 101.8 760.0 107.2 752.4 127.9 751.5 131.9 746.1 145.8 741.6 160.2 739.8 163.3 739.8 165.1 728.1 197.4 724.5 203.2 719.2 206.8 720.1 207.3 735.3 207.3 735.8 206.8 731.7 204.1 730.4 201.0 730.4 197.8 733.1 188.9 737.6 178.1 742.9 170.5 744.7 169.6 758.6 169.6 759.1 170.0 769.4 169.6 772.5 170.0 774.3 171.4 776.1 177.7 777.5 179.9 783.8 196.5 784.7 201.9 783.8 204.1 782.0 205.9 780.6 206.4 781.1 207.3 808.4 207.3 808.9 206.4 805.7 205.0 802.6 201.0 791.8 174.1 791.8 172.7 789.6 168.2 789.6 166.9 782.4 149.8 782.4 148.5 778.8 139.1 777.0 135.9 775.2 130.1 774.3 129.2 773.9 127.0 770.7 120.2 768.1 112.2 763.6 101.8ZM772.5 166.9 771.2 168.2 745.2 167.8 744.3 166.9 748.8 161.5 754.6 156.6 759.1 153.4 763.6 151.6 766.7 152.1ZM756.4 124.7 758.2 128.3 758.2 129.7 759.1 130.6 765.4 148.5 764.0 149.8 758.2 152.1 748.8 158.8 745.2 163.3 742.5 165.5 742.0 163.3 742.9 162.0 743.8 157.9 748.8 145.4 749.2 142.2 753.3 131.9 754.6 126.5ZM954.7 101.8 943.0 101.4 942.6 101.8 935.8 101.8 928.7 103.2 920.1 105.9 910.7 110.8 910.3 111.7 908.9 112.2 904.0 116.2 897.7 122.9 893.2 130.1 888.3 143.1 887.4 148.0 887.8 163.3 890.5 174.1 894.6 182.6 901.7 192.0 906.7 196.5 913.4 201.0 919.7 204.1 921.0 204.1 925.1 205.9 934.1 207.7 941.2 207.7 941.7 208.2 948.9 207.7 960.5 205.5 970.8 201.4 980.3 195.2 991.0 183.5 996.0 173.6 998.7 165.5 998.7 162.9 999.6 159.7 999.1 145.4 996.9 136.4 991.0 124.7 985.2 117.5 980.3 112.6 966.4 105.0ZM935.8 104.1 944.8 104.1 950.2 105.4 957.8 108.6 965.5 114.0 972.2 121.1 978.5 130.6 982.1 139.1 984.3 148.0 984.7 162.4 983.8 168.7 980.7 179.9 977.1 187.1 973.5 192.0 966.4 198.7 958.3 203.2 950.2 205.5 942.6 205.5 933.6 203.2 927.3 200.1 918.3 193.4 912.1 185.7 907.1 176.8 903.1 165.5 901.7 157.5 901.7 143.6 902.6 139.1 905.3 130.1 909.8 121.6 913.9 116.2 920.1 110.4 927.3 106.3Z"/></g><g transform="translate(12.3 273.7) translate(-413.2 -258.0)"><path stroke-width="6" stroke-linejoin="round" fill-rule="evenodd" d="M876.2 278.2 875.7 277.3 874.8 277.3 873.5 279.0 871.2 279.9 867.2 279.9 872.6 280.4 875.7 282.6ZM629.0 283.1 629.0 277.3 628.1 277.3 626.3 279.0 621.8 279.9 611.9 279.9 625.4 280.4ZM432.9 258.9 432.0 259.8 430.7 264.2 429.8 265.1 426.2 274.6 424.0 278.6 420.4 288.9 419.5 289.8 415.4 299.7 413.2 301.9 413.6 302.4 418.1 302.4 418.6 301.9 417.2 300.1 417.2 298.3 420.8 289.4 423.1 287.6 424.0 288.0 428.0 287.6 424.9 287.1 423.5 287.6 422.2 286.2 422.2 285.3 423.5 283.5 427.1 274.1 428.0 273.2 428.0 271.9 430.2 267.4 430.7 264.7 432.0 264.2 433.4 266.0 436.5 274.6 441.5 284.9 441.5 287.6 444.1 291.2 446.8 298.8 446.4 301.9 454.0 302.4 451.3 299.2 438.8 268.7 434.7 261.1 434.3 258.9ZM943.0 258.4 942.6 258.9 943.9 260.7 943.9 299.7 942.6 301.9 943.5 302.4 948.9 302.4 949.3 301.9 948.0 300.1 948.0 282.6 948.9 281.7 948.0 280.4 948.0 260.2 949.3 258.9 957.8 258.9 961.4 259.3 964.6 261.1 966.8 263.3 968.1 266.5 968.6 271.0 967.7 275.0 965.0 278.6 961.0 281.3 954.2 281.7 955.6 282.2 958.3 285.3 967.2 301.5 968.6 302.4 974.0 302.4 974.0 301.5 970.4 297.9 963.2 284.9 961.4 283.1 962.3 281.3 964.1 281.3 968.6 278.6 972.6 273.7 973.1 268.3 970.8 263.3 969.0 261.6 964.1 258.9ZM784.2 258.4 785.6 260.7 785.6 299.7 784.2 302.4 790.5 302.4 790.9 301.5 789.6 299.7 789.6 265.6 790.0 265.1 789.6 261.1 790.9 258.9 790.5 258.4ZM694.9 258.4 696.3 261.6 695.8 265.1 696.3 266.5 696.3 297.4 695.8 300.1 694.5 301.9 694.9 302.4 724.5 302.4 725.4 300.6 725.9 296.5 721.8 301.0 720.5 301.5 713.8 301.5 713.3 301.9 712.9 301.5 701.7 301.5 700.3 300.1 700.3 260.7 701.7 259.3 701.7 258.4ZM605.2 258.4 606.1 263.8 605.7 264.7 606.1 267.4 606.1 288.0 605.7 289.4 606.1 290.7 605.7 291.2 605.7 300.1 604.3 301.5 604.3 302.4 634.4 302.4 635.3 300.6 635.7 297.0 631.7 301.0 627.6 301.9 620.0 301.9 619.6 301.5 612.8 301.9 611.0 301.5 609.7 299.7 609.7 281.3 610.1 280.8 609.7 260.2 611.0 258.9 618.7 258.9 619.1 258.4 629.0 259.3 631.7 260.7 633.5 262.4 633.5 258.9 633.0 258.4ZM534.3 258.9 537.9 258.9 541.9 259.8 545.5 263.3 546.4 263.3 545.5 258.4 535.2 258.4ZM511.0 258.4 510.1 259.3 510.5 263.3 512.8 260.2 516.4 258.9 524.5 258.9 525.8 261.1 525.3 265.6 525.8 291.2 525.3 291.6 525.3 300.1 524.5 301.9 524.9 302.4 530.3 302.4 531.2 301.5 529.4 299.7 529.4 277.7 529.8 277.3 529.4 260.7 530.7 258.9 530.3 258.4ZM880.7 258.4 877.5 258.0 876.2 258.4 852.8 258.4 853.7 262.0 853.3 264.7 853.7 281.7 853.3 282.2 853.3 300.1 852.0 301.5 852.4 302.4 881.1 302.4 882.5 301.5 883.4 296.5 882.5 296.5 881.6 298.8 878.0 301.5 860.9 301.5 860.0 301.9 858.7 301.5 857.3 299.7 857.3 288.5 857.8 288.0 857.3 281.7 858.7 279.9 857.3 278.6 857.3 260.2 859.1 258.9 859.6 259.3 862.3 258.9 875.7 259.3 878.9 260.7 880.7 262.9 881.6 262.9 881.6 260.7Z"/></g>`;
  function mark(x, y, w, fill) {
    const k = w / MARK_W;
    return `<g fill="${fill}" stroke="${fill}" stroke-width="0" transform="translate(${(x - w / 2).toFixed(2)} ${(y - MARK_H * k / 2).toFixed(2)}) scale(${k.toFixed(4)})">${MARK_INNER}</g>`;
  }

  /** Asas centradas em (x, y), com largura w. `stroke` desenha um contorno fino por trás. */
  function wings(x, y, w, fill, stroke) {
    const k = w / 1000;
    const h = w * WINGS_RATIO;
    const outline = stroke ? ` stroke="${stroke}" stroke-width="${(1.4 / k).toFixed(1)}" stroke-opacity=".55" paint-order="stroke" stroke-linejoin="round"` : "";
    return `<path d="${WINGS_D}" fill="${fill}"${outline} transform="translate(${(x - w / 2).toFixed(2)} ${(y - h / 2).toFixed(2)}) scale(${k.toFixed(4)})"/>`;
  }
  let uidCounter = 0;

  // ---------- cores ----------
  const clamp = (n, a = 0, b = 1) => Math.min(b, Math.max(a, n));
  function hexToRgb(hex) {
    let h = String(hex).replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgbToHex = (r, g, b) => "#" + [r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0")).join("");
  function mix(a, b, t) {
    const A = hexToRgb(a), B = hexToRgb(b);
    return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
  }
  const shade = (hex, t) => (t >= 0 ? mix(hex, "#ffffff", t) : mix(hex, "#000000", -t));
  function luminance(hex) {
    const c = hexToRgb(hex).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  const ink = (hex) => (luminance(hex) > 0.36 ? "#16191e" : "#f3f4f1");

  // ---------- geometria ----------
  function polar(r, deg, cx = CX, cy = CY) {
    const a = ((deg - 90) * Math.PI) / 180;
    return [+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)];
  }
  const circlePath = (r, cx = CX, cy = CY) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  function roundRectPath(x, y, w, h, r) {
    return `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
  }
  function octagonPath(hw, hh, ch) {
    const p = [[CX - hw + ch, CY - hh], [CX + hw - ch, CY - hh], [CX + hw, CY - hh + ch], [CX + hw, CY + hh - ch], [CX + hw - ch, CY + hh], [CX - hw + ch, CY + hh], [CX - hw, CY + hh - ch], [CX - hw, CY - hh + ch]];
    return "M" + p.map((q) => q.join(" ")).join("L") + "Z";
  }
  function seeded(seed) {
    let s = seed;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  const isOct = (c) => c.caseShape === "octogonal";
  const dialRadius = (c) => (isOct(c) ? 92 : 102);
  const dialShapePath = (c) => (isOct(c) ? roundRectPath(CX - 94, CY - 94, 188, 188, 46) : circlePath(102));
  const strapWidth = (c) => (c.strapType === "integrada" ? 172 : 124);
  const caseRight = (c) => (c.caseShape === "redonda" ? 340 : c.caseShape === "almofada" ? 336 : 351);
  const dateNum = () => new Date().getDate();

  // ---------- defs (ids únicos por desenho) ----------
  function metalGrad(id, m) {
    return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${shade(m, 0.55)}"/><stop offset=".48" stop-color="${shade(m, -0.28)}"/><stop offset="1" stop-color="${shade(m, 0.32)}"/>
      </linearGradient>`;
  }
  function polishGrad(id, m) {
    return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${shade(m, -0.15)}"/><stop offset=".35" stop-color="${shade(m, 0.7)}"/><stop offset=".65" stop-color="${shade(m, -0.2)}"/><stop offset="1" stop-color="${shade(m, 0.45)}"/>
      </linearGradient>`;
  }

  function defs(u, c) {
    const m = c.caseColor;
    const b1 = c.braceletColor || m;
    const b2 = c.strapTwoTone ? (c.braceletColor2 || b1) : b1;
    return `<defs>${metalGrad(`${u}-bm`, b1)}${polishGrad(`${u}-bp`, b2)}
      <linearGradient id="${u}-metal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${shade(m, 0.55)}"/><stop offset=".48" stop-color="${shade(m, -0.28)}"/><stop offset="1" stop-color="${shade(m, 0.32)}"/>
      </linearGradient>
      <linearGradient id="${u}-polish" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${shade(m, -0.15)}"/><stop offset=".35" stop-color="${shade(m, 0.7)}"/><stop offset=".65" stop-color="${shade(m, -0.2)}"/><stop offset="1" stop-color="${shade(m, 0.45)}"/>
      </linearGradient>
      <radialGradient id="${u}-shade" cx="50%" cy="38%" r="68%">
        <stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#000" stop-opacity=".28"/>
      </radialGradient>
      <radialGradient id="${u}-fume" cx="50%" cy="46%" r="58%">
        <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".55" stop-color="#000" stop-opacity="${Math.min(0.5, 0.12 * (c.dialFumeAmt || 1)).toFixed(2)}"/><stop offset="1" stop-color="#000" stop-opacity="${Math.min(0.96, 0.72 * (c.dialFumeAmt || 1)).toFixed(2)}"/>
      </radialGradient>
      <linearGradient id="${u}-sheen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".1"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
      <clipPath id="${u}-dial"><path d="${dialShapePath(c)}"/></clipPath>
      <pattern id="${u}-weave" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3h6M3 0v6" stroke="#000" stroke-opacity=".22"/></pattern>
      <pattern id="${u}-leather" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="3" r=".8" fill="#000" fill-opacity=".2"/><circle cx="7" cy="7" r=".7" fill="#000" fill-opacity=".16"/></pattern>
    </defs>`;
  }

  // ---------- pulseira ----------
  function strapSegment(u, c, top) {
    const w = strapWidth(c);
    const x = CX - w / 2;
    const y = top ? 0 : 370;
    const h = 150;
    const t = c.strapType;
    const two = !!c.strapTwoTone;
    const c1 = c.strapColor;
    const c2 = c.strapColor2 || c1;
    // faixa central (parte de dentro) quando a pulseira tem duas cores
    const center = (fill, inset = 0) => two ? `<rect x="${x + w * 0.32}" y="${y + inset}" width="${w * 0.36}" height="${h - inset * 2}" fill="${fill}"/>` : "";
    let s = "";
    if (t === "nato") {
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c1}"/>${center(c2)}<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="url(#${u}-weave)"/>`;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="none" stroke="${shade(c1, -0.3)}" stroke-width="1.5"/>`;
      const ky = top ? y + 40 : y + 92;
      s += `<rect x="${x - 4}" y="${ky}" width="${w + 8}" height="14" rx="3" fill="url(#${u}-metal)"/>`;
    } else if (t === "couro") {
      const far = 10;
      const d = top
        ? `M${x + far} ${y}H${x + w - far}L${x + w} ${y + h}H${x}Z`
        : `M${x} ${y}H${x + w}L${x + w - far} ${y + h}H${x + far}Z`;
      s += `<path d="${d}" fill="${c1}"/>${center(c2)}<path d="${d}" fill="url(#${u}-leather)"/>`;
      const ins = top
        ? `M${x + far + 6} ${y + 6}H${x + w - far - 6}L${x + w - 6} ${y + h - 4}H${x + 6}Z`
        : `M${x + 6} ${y + 4}H${x + w - 6}L${x + w - far - 6} ${y + h - 6}H${x + far + 6}Z`;
      s += `<path d="${ins}" fill="none" stroke="${c.stitchColor}" stroke-width="1.3" stroke-dasharray="4 3"/>`;
      s += `<path d="${d}" fill="none" stroke="${shade(c1, -0.35)}" stroke-width="1.5"/>`;
    } else if (t === "borracha") {
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${c1}"/>${center(c2)}`;
      for (let gy = y + 10; gy < y + h - 4; gy += 13) s += `<rect x="${x + 14}" y="${gy}" width="${w - 28}" height="5" rx="2.5" fill="#000" fill-opacity=".2"/>`;
      s += `<rect x="${x + 4}" y="${y}" width="10" height="${h}" fill="#fff" opacity=".08"/>`;
    } else {
      // aço: oyster, jubile, integrada. Elos de fora na primeira cor, elos do centro na segunda.
      const metal = c.braceletColor || c.caseColor;
      const mid = `url(#${u}-bp)`;
      const rows = t === "jubile" ? 16 : t === "integrada" ? 30 : 24;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="url(#${u}-bm)"/>`;
      for (let ry = y; ry < y + h; ry += rows) {
        if (t === "oyster") {
          s += `<rect x="${x + w * 0.34}" y="${ry + 1}" width="${w * 0.32}" height="${rows - 2}" rx="2" fill="${mid}"/>`;
        } else if (t === "jubile") {
          const odd = Math.round((ry - y) / rows) % 2;
          s += `<rect x="${x + w * 0.3}" y="${ry + 2}" width="${w * 0.13}" height="${rows - 4}" rx="4" fill="${mid}"/>`;
          s += `<rect x="${x + w * 0.57}" y="${ry + 2}" width="${w * 0.13}" height="${rows - 4}" rx="4" fill="${mid}"/>`;
          if (odd) s += `<rect x="${x + w * 0.44}" y="${ry + 4}" width="${w * 0.12}" height="${rows - 8}" rx="3" fill="${mid}"/>`;
        } else {
          s += `<rect x="${x + w * 0.4}" y="${ry + 4}" width="${w * 0.2}" height="${rows - 8}" rx="3" fill="${mid}"/>`;
        }
        s += `<path d="M${x} ${ry + rows}h${w}" stroke="${shade(metal, -0.5)}" stroke-opacity=".55"/>`;
      }
      s += `<path d="M${x + w * 0.33} ${y}v${h}M${x + w * 0.67} ${y}v${h}" stroke="${shade(metal, -0.45)}" stroke-opacity=".35"/>`;
    }
    return s;
  }
  const strap = (u, c) => strapSegment(u, c, true) + strapSegment(u, c, false);

  // ---------- caixa ----------
  function crown(u, c) {
    const x = caseRight(c) - 4;
    const s = `<clipPath id="${u}-crown"><rect x="${x}" y="${CY - 16}" width="26" height="32" rx="5"/></clipPath>
      <rect x="${x - 6}" y="${CY - 9}" width="10" height="18" fill="url(#${u}-metal)"/>
      <g data-crown style="cursor:grab">
        <rect x="${x}" y="${CY - 16}" width="26" height="32" rx="5" fill="url(#${u}-metal)"/>
        <g clip-path="url(#${u}-crown)"><g data-knurl>${Array.from({ length: 14 }, (_, i) => `<rect x="${x}" y="${CY - 24 + i * 4}" width="26" height="1.6" fill="${shade(c.caseColor, -0.45)}" opacity=".55"/>`).join("")}</g></g>
        <rect x="${x}" y="${CY - 16}" width="26" height="32" rx="5" fill="none" stroke="${shade(c.caseColor, -0.4)}" stroke-opacity=".6"/>
      </g>`;
    let pushers = "";
    if (c.dialLayout === "crono") {
      for (const [deg, role] of [[60, "start"], [120, "reset"]]) {
        const [px, py] = polar(caseRight(c) - CX - 2, deg);
        pushers += `<g data-pusher="${role}" style="cursor:pointer" transform="rotate(${deg - 90} ${px} ${py})"><rect x="${px - 4}" y="${py - 7}" width="16" height="14" rx="3" fill="url(#${u}-metal)" stroke="${shade(c.caseColor, -0.4)}" stroke-opacity=".5"/></g>`;
      }
    }
    return s + pushers;
  }

  function caseBody(u, c, hollow = false) {
    const m = `url(#${u}-metal)`;
    // na vista explodida a caixa é um anel: dá para ver o movimento lá dentro
    const hole = hollow ? circlePath(isOct(c) ? 96 : 104) : "";
    const edge = shade(c.caseColor, -0.45);
    let s = crown(u, c);
    if (c.caseShape === "redonda") {
      s += `<path d="M138 150 L150 116 H250 L262 150 Z M138 370 L150 404 H250 L262 370 Z" fill="${m}"/>`;
      s += `<path d="${circlePath(140)}${hole}" fill-rule="evenodd" fill="${m}"/><circle cx="${CX}" cy="${CY}" r="139" fill="none" stroke="${edge}" stroke-opacity=".35" stroke-width="2"/>`;
    } else if (c.caseShape === "almofada") {
      s += `<path d="M146 140 L154 112 H246 L254 140 Z M146 380 L154 408 H246 L254 380 Z" fill="${m}"/>`;
      s += `<path d="${roundRectPath(64, 124, 272, 272, 82)}${hole}" fill-rule="evenodd" fill="${m}"/><rect x="65" y="125" width="270" height="270" rx="81" fill="none" stroke="${edge}" stroke-opacity=".35" stroke-width="2"/>`;
    } else {
      s += `<rect x="${CX - 168}" y="${CY - 26}" width="24" height="52" rx="7" fill="${m}"/><rect x="${CX + 144}" y="${CY - 26}" width="24" height="52" rx="7" fill="${m}"/>`;
      s += `<path d="${octagonPath(140, 134, 46)}" fill="none" stroke="${m}" stroke-width="22" stroke-linejoin="round"/>`;
      s += `<path d="${octagonPath(140, 134, 46)}${hole}" fill-rule="evenodd" fill="${m}"/>`;
      s += `<path d="${octagonPath(140, 134, 46)}" fill="none" stroke="${edge}" stroke-opacity=".25" stroke-width="1.5" stroke-linejoin="round"/>`;
    }
    return s;
  }

  // ---------- luneta ----------
  function bezel(u, c) {
    if (isOct(c)) {
      const d = octagonPath(122, 116, 40) + roundRectPath(CX - 99, CY - 99, 198, 198, 50);
      return `<path d="${d}" fill-rule="evenodd" fill="url(#${u}-polish)" stroke="${shade(c.caseColor, -0.35)}" stroke-opacity=".4"/>`;
    }
    const ring = circlePath(133) + circlePath(104);
    const t = c.bezelType;
    if (t === "lisa") return `<path d="${ring}" fill-rule="evenodd" fill="url(#${u}-polish)"/><circle cx="${CX}" cy="${CY}" r="133" fill="none" stroke="${shade(c.caseColor, -0.4)}" stroke-opacity=".35"/>`;
    if (t === "canelada") {
      let s = `<path d="${ring}" fill-rule="evenodd" fill="url(#${u}-polish)"/>`;
      for (let i = 0; i < 72; i++) {
        const [x1, y1] = polar(106, i * 5);
        const [x2, y2] = polar(132, i * 5);
        s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${i % 2 ? shade(c.caseColor, 0.7) : shade(c.caseColor, -0.5)}" stroke-width="2.2" stroke-opacity=".7"/>`;
      }
      return s;
    }
    const base = c.bezelColor;
    const ik = c.bezelInk || ink(base);
    // cerâmica com brilho: o mesmo degradê da luneta da página inicial
    const cer = c.bezelGloss ? `<defs><radialGradient id="${u}-cer" cx=".38" cy=".3" r=".9"><stop offset="0" stop-color="${shade(base, 0.22)}"/><stop offset=".55" stop-color="${base}"/><stop offset="1" stop-color="${shade(base, -0.5)}"/></radialGradient></defs>` : "";
    let s = `${cer}<path d="${ring}" fill-rule="evenodd" fill="${c.bezelGloss ? `url(#${u}-cer)` : base}"/>`;
    if (c.bezelTwoTone) s += `<path d="M${CX - 133} ${CY}A133 133 0 0 1 ${CX + 133} ${CY}H${CX + 104}A104 104 0 0 0 ${CX - 104} ${CY}Z" fill="${c.bezelColor2}"/>`;
    const inkAt = (deg) => (c.bezelTwoTone && (deg <= 90 || deg >= 270) ? ink(c.bezelColor2) : ik);
    if (t === "mergulho") {
      const [tx, ty] = polar(124, 0);
      s += `<path d="M${tx - 7} ${ty - 5}L${tx + 7} ${ty - 5}L${tx} ${ty + 7}Z" fill="${inkAt(0)}"/><circle cx="${tx}" cy="${ty - 0.5}" r="2.4" fill="#dfeee0"/>`;
      for (let m = 5; m < 60; m += 5) {
        const deg = m * 6;
        const [x, y] = polar(119, deg);
        s += m % 10 === 0
          ? `<text x="${x}" y="${y + 5}" text-anchor="middle" font-family="Saira, sans-serif" font-size="15" font-weight="500" fill="${inkAt(deg)}" transform="rotate(${deg} ${x} ${y})">${m}</text>`
          : `<rect x="${x - 2}" y="${y - 7}" width="4" height="14" rx="1" fill="${inkAt(deg)}" transform="rotate(${deg} ${x} ${y})"/>`;
      }
      for (let m = 1; m < 15; m++) {
        if (m % 5 === 0) continue;
        const [x1, y1] = polar(130, m * 6);
        const [x2, y2] = polar(124, m * 6);
        s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${inkAt(m * 6)}" stroke-width="1.4"/>`;
      }
    } else {
      // taquímetro: velocidade v corresponde a 3600/v segundos
      const marks = [400, 300, 240, 200, 180, 160, 140, 120, 110, 100, 90, 85, 80, 75, 70, 65, 60];
      for (const v of marks) {
        const deg = (3600 / v) * 6;
        const [x, y] = polar(117, deg);
        const [l1x, l1y] = polar(131, deg);
        const [l2x, l2y] = polar(126, deg);
        s += `<line x1="${l1x}" y1="${l1y}" x2="${l2x}" y2="${l2y}" stroke="${inkAt(deg % 360)}" stroke-width="1.2"/>`;
        s += `<text x="${x}" y="${y + 4}" text-anchor="middle" font-family="Saira, sans-serif" font-size="11" fill="${inkAt(deg % 360)}" transform="rotate(${deg} ${x} ${y})">${v}</text>`;
      }
      for (let v = 400; v > 60; v -= v > 200 ? 20 : v > 100 ? 10 : 5) {
        if (marks.includes(v)) continue;
        const deg = (3600 / v) * 6;
        const [a, b] = polar(131, deg);
        const [cx2, cy2] = polar(128, deg);
        s += `<line x1="${a}" y1="${b}" x2="${cx2}" y2="${cy2}" stroke="${inkAt(deg)}" stroke-width=".8"/>`;
      }
    }
    return s;
  }

  // ---------- mostrador ----------
  function dialFinish(u, c) {
    const f = c.dialFinish;
    const dr = dialRadius(c);
    let s = "";
    if (f === "raios") {
      for (let i = 0; i < 120; i++) {
        const [x2, y2] = polar(dr + 6, i * 3);
        s += `<line x1="${CX}" y1="${CY}" x2="${x2}" y2="${y2}" stroke="${i % 2 ? "#fff" : "#000"}" stroke-opacity="${i % 2 ? 0.07 : 0.05}" stroke-width="1.6"/>`;
      }
      s += `<rect x="${CX - dr}" y="${CY - dr}" width="${dr * 2}" height="${dr * 2}" fill="url(#${u}-sheen)"/>`;
    } else if (f === "listrado") {
      for (let y = CY - dr; y < CY + dr; y += 5) {
        s += `<path d="M${CX - dr} ${y}h${dr * 2}" stroke="#000" stroke-opacity=".22" stroke-width="1.3"/><path d="M${CX - dr} ${y + 1.6}h${dr * 2}" stroke="#fff" stroke-opacity=".07"/>`;
      }
    } else if (f === "texturizado") {
      const rnd = seeded(7);
      for (let i = 0; i < 260; i++) {
        const a = rnd() * 360, r = Math.sqrt(rnd()) * dr;
        const [x, y] = polar(r, a);
        s += `<ellipse cx="${x}" cy="${y}" rx="${2 + rnd() * 6}" ry="${1.5 + rnd() * 4}" transform="rotate(${rnd() * 180} ${x} ${y})" fill="${rnd() > 0.5 ? "#fff" : "#000"}" fill-opacity="${0.05 + rnd() * 0.09}"/>`;
      }
    } else if (f === "grade") {
      for (let p = -dr; p <= dr; p += 9) {
        s += `<path d="M${CX - dr} ${CY + p}h${dr * 2}M${CX + p} ${CY - dr}v${dr * 2}" stroke="#000" stroke-opacity=".28" stroke-width="1.4"/>`;
        s += `<path d="M${CX - dr} ${CY + p + 1.5}h${dr * 2}M${CX + p + 1.5} ${CY - dr}v${dr * 2}" stroke="#fff" stroke-opacity=".07"/>`;
      }
    }
    return s;
  }

  const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

  function indices(c) {
    const dr = dialRadius(c);
    const skip = new Set();
    if (c.dialLayout === "data") skip.add(3);
    if (c.dialLayout === "crono") { skip.add(3); skip.add(6); skip.add(9); }
    const lumeFill = "#eef3df";
    const body = c.indexColor;
    const edge = shade(body, -0.35);
    let s = "";
    for (let h = 0; h < 12; h++) {
      if (skip.has(h)) continue;
      const deg = h * 30;
      if (c.indexStyle === "romanos" || c.indexStyle === "arabicos") {
        const [x, y] = polar(dr * 0.8, deg);
        const txt = c.indexStyle === "romanos" ? ROMAN[h] : String(h || 12);
        const fam = c.indexStyle === "romanos" ? "'Bodoni Moda', Georgia, serif" : "Saira, sans-serif";
        const fs = c.indexStyle === "romanos" ? (txt.length > 2 ? 12 : 14) : 16;
        s += `<text x="${x}" y="${y + fs * 0.36}" text-anchor="middle" font-family="${fam}" font-size="${fs}" font-weight="500" fill="${body}">${txt}</text>`;
      } else if (c.indexStyle === "pontos") {
        const [x, y] = polar(dr * 0.86, deg);
        if (h === 0) s += `<path d="M${x - 7} ${y - 6}L${x + 7} ${y - 6}L${x} ${y + 6}Z" fill="${c.lume ? lumeFill : body}" stroke="${body}" stroke-width="1.4"/>`;
        else s += `<circle cx="${x}" cy="${y}" r="${h % 3 === 0 ? 6 : 5}" fill="${c.lume ? lumeFill : body}" stroke="${body}" stroke-width="1.4"/>`;
      } else {
        const len = h % 3 === 0 ? dr * 0.2 : dr * 0.15;
        const [x, y] = polar(dr * 0.93 - len / 2, deg);
        const bar = (dx) => `<rect x="${x - 2.6 + dx}" y="${y - len / 2}" width="5.2" height="${len}" rx="1" fill="${c.lume ? lumeFill : body}" stroke="${c.lume ? body : edge}" stroke-width="1.3" transform="rotate(${deg} ${x} ${y})"/>`;
        s += h === 0 ? bar(-4.2) + bar(4.2) : bar(0);
      }
    }
    // trilho de minutos
    const tk = ink(c.dialColor);
    for (let m = 0; m < 60; m++) {
      if (m % 5 === 0) continue;
      const [x1, y1] = polar(dr - 1, m * 6);
      const [x2, y2] = polar(dr - 5, m * 6);
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${tk}" stroke-opacity=".7" stroke-width=".8"/>`;
    }
    return s;
  }

  function subdial(c, cx, cy, r, role) {
    const col = c.subdialColor;
    const tk = ink(col);
    let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${shade(col, -0.35)}" stroke-width="1.2"/>`;
    for (let i = 0; i < 12; i++) {
      const [x1, y1] = polar(r - 2, i * 30, cx, cy);
      const [x2, y2] = polar(r - (i % 3 === 0 ? 8 : 5), i * 30, cx, cy);
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${tk}" stroke-width="${i % 3 === 0 ? 1.4 : 0.8}"/>`;
    }
    s += `<g data-hand="${role}" data-cx="${cx}" data-cy="${cy}"><rect x="${cx - 1}" y="${cy - r + 5}" width="2" height="${r - 3}" rx="1" fill="${c.handColor}"/><circle cx="${cx}" cy="${cy}" r="2.6" fill="${c.handColor}"/></g>`;
    return s;
  }

  const MOVEMENT_LABEL = { quartzo: "QUARTZO", automatico: "AUTOMÁTICO", manual: "CORDA MANUAL" };

  const isSkeleton = (c) => !!c.skeleton && !!c.swiss && c.movement !== "quartzo";

  function dial(u, c) {
    const dr = dialRadius(c);
    const shapeD = dialShapePath(c);
    let s = `<path d="${isOct(c) ? roundRectPath(CX - 98, CY - 98, 196, 196, 50) : circlePath(105)}" fill="#14171b"/>`;
    if (isSkeleton(c)) return s + skeletonDial(u, c, dr, shapeD);
    if (c.dialImage) {
      // laca pintada fora (a da página inicial): vale no lugar da cor, do acabamento e do degradê
      s += `<g clip-path="url(#${u}-dial)"><image href="${c.dialImage}" x="${CX - dr}" y="${CY - dr}" width="${dr * 2}" height="${dr * 2}" preserveAspectRatio="none"/></g>`;
    } else {
      s += `<path d="${shapeD}" fill="${c.dialColor}"/>`;
      s += `<g clip-path="url(#${u}-dial)">${dialFinish(u, c)}${c.dialFume ? `<path d="${shapeD}" fill="url(#${u}-fume)"/>` : ""}<path d="${shapeD}" fill="url(#${u}-shade)"/></g>`;
    }
    s += indices(c);
    const tk = ink(c.dialColor);
    if (c.dialLayout === "crono") {
      const off = dr * 0.5;
      const r = dr * 0.27;
      s += subdial(c, CX + off, CY, r, "cm") + subdial(c, CX, CY + off, r, "ch") + subdial(c, CX - off, CY, r, "sub");
      s += mark(CX, CY - dr * 0.52, 40, tk);
      s += `<text x="${CX}" y="${CY - dr * 0.3}" text-anchor="middle" font-family="Saira, sans-serif" font-size="4.8" letter-spacing="1.6" fill="${tk}" opacity=".8">CRONÓGRAFO</text>`;
    } else {
      s += mark(CX, CY - dr * 0.5, 50, tk);
      if (c.dialLabel !== false) s += `<text x="${CX}" y="${CY + dr * 0.45}" text-anchor="middle" font-family="Saira, sans-serif" font-size="6" letter-spacing="1.8" fill="${tk}" opacity=".85">${MOVEMENT_LABEL[c.movement]}</text>`;
      if (c.dialLayout === "data") {
        const x = CX + dr * 0.66;
        s += `<rect x="${x - 12}" y="${CY - 9.5}" width="24" height="19" rx="2" fill="#f4f4f1" stroke="${shade(c.dialColor, -0.4)}" stroke-width="1"/>`;
        s += `<text x="${x}" y="${CY + 4.5}" text-anchor="middle" font-family="Saira, sans-serif" font-size="12" font-weight="500" fill="#16191e">${dateNum()}</text>`;
      }
    }
    return s;
  }

  /** Mostrador esqueleto: só o anel das horas fica; o centro mostra o mecanismo funcionando. */
  function skeletonDial(u, c, dr, shapeD) {
    const inner = dr * 0.7;
    let s = `<g clip-path="url(#${u}-dial)"><circle cx="${CX}" cy="${CY}" r="${dr + 8}" fill="#0d0f12"/>${movement(u, c, dr + 4, true)}</g>`;
    // anel das horas na cor do mostrador
    const ring = `${shapeD}${circlePath(inner)}`;
    s += `<path d="${ring}" fill-rule="evenodd" fill="${c.dialColor}"/>`;
    if (c.dialFume) s += `<path d="${ring}" fill-rule="evenodd" fill="url(#${u}-fume)"/>`;
    s += `<path d="${ring}" fill-rule="evenodd" fill="url(#${u}-shade)"/>`;
    // ponte vazada entre 12 e 6, como nos esqueletos clássicos
    const bw = 7;
    s += `<path d="M${CX - bw} ${CY - inner + 2} Q${CX - bw * 2.2} ${CY} ${CX - bw} ${CY + inner - 2} L${CX - bw + 3} ${CY + inner - 2} Q${CX - bw * 1.4} ${CY} ${CX - bw + 3} ${CY - inner + 2}Z" fill="${c.dialColor}" opacity=".9"/>`;
    s += `<circle cx="${CX}" cy="${CY}" r="${inner}" fill="none" stroke="${shade(c.dialColor, 0.35)}" stroke-width="1.6"/>`;
    s += `<circle cx="${CX}" cy="${CY}" r="${inner - 3}" fill="none" stroke="#000" stroke-opacity=".35" stroke-width="2"/>`;
    s += indices({ ...c, dialLayout: c.dialLayout === "data" ? "sem-data" : c.dialLayout });
    if (c.dialLayout === "crono") {
      const off = dr * 0.5;
      const r = dr * 0.27;
      s += subdial(c, CX + off, CY, r, "cm") + subdial(c, CX, CY + off, r, "ch") + subdial(c, CX - off, CY, r, "sub");
    }
    s += wings(CX, CY - inner + 12, 30, "#f4f4f1", "#14171b");
    return s;
  }

  // ---------- ponteiros ----------
  const P = (x, y) => `${+(CX + x).toFixed(2)},${+(CY + y).toFixed(2)}`;
  const poly = (pts, fill, extra = "") => `<polygon points="${pts.map(([x, y]) => P(x, y)).join(" ")}" fill="${fill}" ${extra}/>`;

  function hand(style, kind, c) {
    const col = c.handColor;
    const edge = `stroke="${shade(col, -0.45)}" stroke-width=".7" stroke-linejoin="round"`;
    const lume = c.lume ? "#eef3df" : null;
    const L = kind === "h" ? (isOct(c) ? 54 : 60) : (isOct(c) ? 82 : 92);
    const w = kind === "h" ? 9 : 7;
    let st = style;
    if (kind === "m" && ["mercedes", "flecha", "floco"].includes(style)) st = "espada";
    let s = "";
    switch (st) {
      case "bastao":
        s += `<rect x="${CX - w / 2}" y="${CY - L}" width="${w}" height="${L + 14}" rx="1.2" fill="${col}" ${edge}/>`;
        if (lume) s += `<rect x="${CX - w / 2 + 1.7}" y="${CY - L + 4}" width="${w - 3.4}" height="${L - 18}" rx="1" fill="${lume}"/>`;
        break;
      case "espada":
        s += poly([[-1.6, 16], [-w / 2, -L * 0.2], [-w / 2 + 0.4, -L * 0.82], [0, -L], [w / 2 - 0.4, -L * 0.82], [w / 2, -L * 0.2], [1.6, 16]], col, edge);
        if (lume) s += poly([[-w / 2 + 1.8, -L * 0.24], [-w / 2 + 2, -L * 0.8], [0, -L + 6], [w / 2 - 2, -L * 0.8], [w / 2 - 1.8, -L * 0.24]], lume);
        break;
      case "dauphine":
        s += poly([[0, 16], [-w * 0.62, -L * 0.1], [0, -L], [w * 0.62, -L * 0.1]], col, edge);
        s += poly([[0, 16], [0, -L], [w * 0.62, -L * 0.1]], shade(col, 0.35));
        if (lume) s += poly([[-0.9, -L * 0.2], [0, -L * 0.85], [0.9, -L * 0.2]], lume);
        break;
      case "folha":
        s += `<path d="M${P(0, 16)} C${P(-w * 1.15, -L * 0.25)} ${P(-w * 0.75, -L * 0.72)} ${P(0, -L)} C${P(w * 0.75, -L * 0.72)} ${P(w * 1.15, -L * 0.25)} ${P(0, 16)}Z" fill="${col}" ${edge}/>`;
        if (lume) s += `<path d="M${P(0, -L * 0.12)} C${P(-w * 0.7, -L * 0.3)} ${P(-w * 0.45, -L * 0.7)} ${P(0, -L * 0.88)} C${P(w * 0.45, -L * 0.7)} ${P(w * 0.7, -L * 0.3)} ${P(0, -L * 0.12)}Z" fill="${lume}"/>`;
        break;
      case "seringa":
        s += `<rect x="${CX - w / 2}" y="${CY - L * 0.56}" width="${w}" height="${L * 0.56 + 14}" rx="1.2" fill="${col}" ${edge}/>`;
        s += poly([[-w * 0.17, -L * 0.56], [0, -L], [w * 0.17, -L * 0.56]], col, edge);
        if (lume) s += `<rect x="${CX - w / 2 + 1.7}" y="${CY - L * 0.53}" width="${w - 3.4}" height="${L * 0.4}" rx="1" fill="${lume}"/>`;
        break;
      case "mercedes": {
        const cy = -L * 0.66, r = w * 1.05;
        s += `<rect x="${CX - 1.8}" y="${CY + cy + r - 1}" width="3.6" height="${-cy - r + 15}" fill="${col}" ${edge}/>`;
        s += poly([[-w * 0.36, cy - r + 1], [0, -L], [w * 0.36, cy - r + 1]], col, edge);
        s += `<circle cx="${CX}" cy="${CY + cy}" r="${r}" fill="${col}" ${edge}/>`;
        s += `<circle cx="${CX}" cy="${CY + cy}" r="${r - 1.8}" fill="${lume || shade(col, -0.6)}"/>`;
        for (const a of [0, 120, 240]) {
          const [x2, y2] = polar(r - 1, a, CX, CY + cy);
          s += `<line x1="${CX}" y1="${CY + cy}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="1.8"/>`;
        }
        break;
      }
      case "catedral":
        s += `<rect x="${CX - 1.6}" y="${CY - L * 0.32}" width="3.2" height="${L * 0.32 + 14}" fill="${col}" ${edge}/>`;
        s += `<path d="M${P(-w * 0.75, -L * 0.3)} L${P(-w * 0.75, -L * 0.62)} Q${P(-w * 0.75, -L * 0.82)} ${P(0, -L * 0.88)} Q${P(w * 0.75, -L * 0.82)} ${P(w * 0.75, -L * 0.62)} L${P(w * 0.75, -L * 0.3)}Z" fill="${col}" ${edge}/>`;
        s += poly([[-1.4, -L * 0.86], [0, -L], [1.4, -L * 0.86]], col, edge);
        if (lume) {
          s += `<path d="M${P(-w * 0.45, -L * 0.34)} V${CY - L * 0.58} Q${P(-w * 0.45, -L * 0.68)} ${P(-0.8, -L * 0.7)} V${CY - L * 0.34}Z" fill="${lume}"/>`;
          s += `<path d="M${P(w * 0.45, -L * 0.34)} V${CY - L * 0.58} Q${P(w * 0.45, -L * 0.68)} ${P(0.8, -L * 0.7)} V${CY - L * 0.34}Z" fill="${lume}"/>`;
        }
        break;
      case "breguet": {
        const cy = -L * (kind === "h" ? 0.64 : 0.78), r = w * 0.85;
        s += poly([[-1.5, 14], [-1.1, cy + r], [1.1, cy + r], [1.5, 14]], col, edge);
        s += `<circle cx="${CX}" cy="${CY + cy}" r="${r}" fill="none" stroke="${col}" stroke-width="2.4"/>`;
        s += poly([[-1.1, cy - r], [0, -L], [1.1, cy - r]], col, edge);
        s += `<circle cx="${CX}" cy="${CY + 10}" r="3" fill="${col}"/>`;
        break;
      }
      case "flecha":
        s += `<rect x="${CX - 1.8}" y="${CY - L * 0.62}" width="3.6" height="${L * 0.62 + 14}" fill="${col}" ${edge}/>`;
        s += poly([[-w * 1.1, -L * 0.58], [0, -L], [w * 1.1, -L * 0.58]], col, edge);
        if (lume) s += poly([[-w * 0.7, -L * 0.62], [0, -L * 0.9], [w * 0.7, -L * 0.62]], lume);
        break;
      case "floco":
        s += `<rect x="${CX - 1.8}" y="${CY - L * 0.55}" width="3.6" height="${L * 0.55 + 14}" fill="${col}" ${edge}/>`;
        s += `<rect x="${CX - w * 0.85}" y="${CY - L * 0.86}" width="${w * 1.7}" height="${w * 1.7}" rx="1" fill="${col}" ${edge}/>`;
        if (lume) s += `<rect x="${CX - w * 0.85 + 1.8}" y="${CY - L * 0.86 + 1.8}" width="${w * 1.7 - 3.6}" height="${w * 1.7 - 3.6}" fill="${lume}"/>`;
        s += poly([[-1.6, -L * 0.86], [0, -L], [1.6, -L * 0.86]], col, edge);
        break;
    }
    return s;
  }

  function secondHand(c) {
    const col = c.secondColor;
    const L = isOct(c) ? 86 : 96;
    let s = `<rect x="${CX - 0.8}" y="${CY - L}" width="1.6" height="${L + 24}" fill="${col}"/>`;
    s += `<circle cx="${CX}" cy="${CY + 18}" r="3.4" fill="${col}"/>`;
    if (c.secondStyle === "pirulito") s += `<circle cx="${CX}" cy="${CY - L * 0.7}" r="4.6" fill="${col}"/>${c.lume ? `<circle cx="${CX}" cy="${CY - L * 0.7}" r="2.8" fill="#eef3df"/>` : ""}`;
    if (c.secondStyle === "seta") s += poly([[-4, -L * 0.82], [0, -L], [4, -L * 0.82]], col);
    return s;
  }

  function hands(u, c) {
    const role = c.dialLayout === "crono" ? "chrono" : "s";
    return `<g data-hand="h">${hand(c.handStyle, "h", c)}</g>
      <g data-hand="m">${hand(c.handStyle, "m", c)}</g>
      <g data-hand="${role}">${secondHand(c)}</g>
      <circle cx="${CX}" cy="${CY}" r="5" fill="${c.handColor}" stroke="${shade(c.handColor, -0.45)}" stroke-width=".7"/>
      <circle cx="${CX}" cy="${CY}" r="2" fill="${c.secondColor}"/>`;
  }

  // ---------- cristal ----------
  function crystal(u, c) {
    const d = isOct(c) ? roundRectPath(CX - 99, CY - 99, 198, 198, 50) : circlePath(104);
    return `<path d="${d}" fill="#dfe9f2" fill-opacity=".07"/><path d="${d}" fill="none" stroke="#9fb1c4" stroke-opacity=".45" stroke-width="1.4"/>
      <ellipse cx="${CX - 40}" cy="${CY - 62}" rx="66" ry="34" fill="#fff" opacity=".07" transform="rotate(-30 ${CX - 40} ${CY - 62})"/>`;
  }

  // ---------- movimento ----------
  function movement(u, c, r = 96, front = false) {
    const plate = "#c3c7cd";
    const brass = "#c9a44c";
    const ruby = "#b4233c";
    let s = `<circle cx="${CX}" cy="${CY}" r="${r}" fill="${plate}"/>`;
    if (c.movement === "quartzo") {
      s = `<circle cx="${CX}" cy="${CY}" r="${r}" fill="#2a2d33"/>`;
      s += `<circle cx="${CX - 28}" cy="${CY + 28}" r="${r * 0.32}" fill="#d5d8dc" stroke="#9aa0a6" stroke-width="2"/><text x="${CX - 28}" y="${CY + 32}" text-anchor="middle" font-family="Saira, sans-serif" font-size="9" fill="#5b6067">SR920SW</text>`;
      s += `<rect x="${CX + 14}" y="${CY - 48}" width="46" height="22" rx="4" fill="#b8743a"/><g stroke="#8a5222">${Array.from({ length: 10 }, (_, i) => `<line x1="${CX + 18 + i * 4}" y1="${CY - 46}" x2="${CX + 18 + i * 4}" y2="${CY - 28}"/>`).join("")}</g>`;
      s += `<rect x="${CX + 10}" y="${CY + 4}" width="40" height="26" rx="3" fill="#3c6b4a"/><circle cx="${CX - 40}" cy="${CY - 40}" r="10" fill="#8c9096"/>`;
      s += `<text x="${CX}" y="${CY - 66}" text-anchor="middle" font-family="Saira, sans-serif" font-size="8" letter-spacing="1.5" fill="#9aa0a6">QUARTZ · 0 JEWELS</text>`;
      return s;
    }
    // perlage
    const rnd = seeded(3);
    for (let i = 0; i < 70; i++) {
      const a = rnd() * 360, rr = Math.sqrt(rnd()) * (r - 8);
      const [x, y] = polar(rr, a);
      s += `<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="#fff" stroke-opacity=".28"/>`;
    }
    // pontes com côtes de Genève
    s += `<clipPath id="${u}-bridge"><path d="M${CX - r + 10} ${CY - 20} Q${CX - 20} ${CY - r + 6} ${CX + 50} ${CY - r + 20} L${CX + 40} ${CY - 10} Q${CX} ${CY + 10} ${CX - r + 14} ${CY + 20}Z"/></clipPath>`;
    s += `<path d="M${CX - r + 10} ${CY - 20} Q${CX - 20} ${CY - r + 6} ${CX + 50} ${CY - r + 20} L${CX + 40} ${CY - 10} Q${CX} ${CY + 10} ${CX - r + 14} ${CY + 20}Z" fill="#d3d6db" stroke="#8d939a"/>`;
    s += `<g clip-path="url(#${u}-bridge)">${Array.from({ length: 16 }, (_, i) => `<line x1="${CX - 120 + i * 14}" y1="${CY - 120}" x2="${CX - 40 + i * 14}" y2="${CY + 60}" stroke="#fff" stroke-opacity=".35" stroke-width="5"/>`).join("")}</g>`;
    // trem de engrenagens
    for (const [gx, gy, gr] of [[CX + 18, CY + 30, 20], [CX - 30, CY + 50, 14], [CX + 54, CY - 6, 12]]) {
      s += `<circle cx="${gx}" cy="${gy}" r="${gr}" fill="${brass}"/><circle cx="${gx}" cy="${gy}" r="${gr - 4}" fill="none" stroke="#8f6e22" stroke-width="1.5" stroke-dasharray="2 2"/><circle cx="${gx}" cy="${gy}" r="2.6" fill="${ruby}"/>`;
    }
    // catraca (gira quando dá corda)
    s += `<g data-ratchet data-cx="${CX - 22}" data-cy="${CY - 32}"><circle cx="${CX - 22}" cy="${CY - 32}" r="26" fill="#aeb3ba" stroke="#7b8188"/>${Array.from({ length: 24 }, (_, i) => { const [a, b] = polar(26, i * 15, CX - 22, CY - 32); const [c2, d2] = polar(21, i * 15 + 6, CX - 22, CY - 32); return `<line x1="${a}" y1="${b}" x2="${c2}" y2="${d2}" stroke="#6f757c"/>`; }).join("")}<circle cx="${CX - 22}" cy="${CY - 32}" r="6" fill="#868c93"/></g>`;
    // balanço (oscila)
    const bx = CX + 46, by = CY + 46;
    s += `<g data-balance data-cx="${bx}" data-cy="${by}"><circle cx="${bx}" cy="${by}" r="24" fill="none" stroke="${brass}" stroke-width="4"/>${[0, 120, 240].map((a) => { const [x, y] = polar(22, a, bx, by); return `<line x1="${bx}" y1="${by}" x2="${x}" y2="${y}" stroke="${brass}" stroke-width="2.5"/>`; }).join("")}<path d="M${bx} ${by} m-14 0 a14 14 0 1 1 28 0 a11 11 0 1 1 -22 0 a8 8 0 1 1 16 0" fill="none" stroke="#5b6170" stroke-width=".8"/><circle cx="${bx}" cy="${by}" r="2.6" fill="${ruby}"/></g>`;
    for (const [jx, jy] of [[CX - 60, CY + 10], [CX + 70, CY + 30], [CX - 10, CY + 78], [CX + 20, CY - 70]]) s += `<circle cx="${jx}" cy="${jy}" r="3" fill="${ruby}" stroke="#d9d9d9" stroke-width="1.2"/>`;
    if (c.movement === "automatico" && !front) {
      const rc = c.rotorColor;
      let waves = "";
      for (let row = 0; row < 6; row++) for (let col = -6; col < 7; col++) {
        const wx = CX + col * 16 + (row % 2) * 8, wy = CY - 20 - row * 11;
        waves += `<path d="M${wx - 8} ${wy} a8 8 0 0 1 16 0" fill="none" stroke="${shade(rc, 0.45)}" stroke-width="1.2"/><path d="M${wx - 5} ${wy} a5 5 0 0 1 10 0" fill="none" stroke="${shade(rc, 0.45)}" stroke-width="1"/>`;
      }
      s += `<clipPath id="${u}-rotor"><path d="M${CX - r + 4} ${CY} A${r - 4} ${r - 4} 0 0 1 ${CX + r - 4} ${CY} L${CX + 16} ${CY} A16 16 0 0 0 ${CX - 16} ${CY}Z"/></clipPath>`;
      s += `<g data-rotor><path d="M${CX - r + 4} ${CY} A${r - 4} ${r - 4} 0 0 1 ${CX + r - 4} ${CY} L${CX + 16} ${CY} A16 16 0 0 0 ${CX - 16} ${CY}Z" fill="${rc}" stroke="${shade(rc, -0.35)}"/><g clip-path="url(#${u}-rotor)">${waves}</g>
        ${wings(CX, CY - r * 0.66, 46, ink(rc))}</g>`;
      s += `<circle cx="${CX}" cy="${CY}" r="9" fill="#9aa0a6" stroke="#6f757c"/><circle cx="${CX}" cy="${CY}" r="3" fill="${ruby}"/>`;
    } else if (c.movement === "manual") {
      s += `<text x="${CX}" y="${CY + r - 14}" text-anchor="middle" font-family="Saira, sans-serif" font-size="7" letter-spacing="1.4" fill="#5b6067">${c.swiss ? "SWISS · SELLITA SW210-1" : "17 JEWELS · CORDA MANUAL"}</text>`;
    }
    if (front) s += `<circle cx="${CX}" cy="${CY}" r="7" fill="#9aa0a6" stroke="#6f757c"/>`;
    return s;
  }

  // ---------- montagem ----------
  function wrap(u, c, inner, label) {
    return `<svg viewBox="0 0 400 520" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${defs(u, c)}${inner}</svg>`;
  }

  function front(c, label = "Desenho do relógio") {
    const u = `w${++uidCounter}`;
    return wrap(u, c, strap(u, c) + caseBody(u, c) + dial(u, c) + hands(u, c) + bezel(u, c) + crystal(u, c), label);
  }

  /** Camadas separadas, de baixo para cima, para a vista explodida. `level` é a altura de cada uma. */
  function layers(c) {
    const u = `w${++uidCounter}`;
    const parts = [
      ["pulseira", strapSegment(u, c, true), 0],
      ["pulseira-baixo", strapSegment(u, c, false), 0],
      ["movimento", movement(u, c), 1],
      ["caixa", caseBody(u, c, true), 2],
      ["mostrador", dial(u, c), 3],
      ["ponteiros", hands(u, c), 4],
      ["luneta", bezel(u, c), 5],
      ["cristal", crystal(u, c), 6],
    ];
    return parts.map(([name, inner, level]) => ({ name, level, svg: wrap(u, c, inner, name) }));
  }

  function back(c) {
    const u = `w${++uidCounter}`;
    const m = `url(#${u}-metal)`;
    let s = strap(u, c);
    if (c.caseShape === "redonda") s += `<path d="M138 150 L150 116 H250 L262 150 Z M138 370 L150 404 H250 L262 370 Z" fill="${m}"/><circle cx="${CX}" cy="${CY}" r="140" fill="${m}"/>`;
    else if (c.caseShape === "almofada") s += `<path d="M146 140 L154 112 H246 L254 140 Z M146 380 L154 408 H246 L254 380 Z" fill="${m}"/><rect x="64" y="124" width="272" height="272" rx="82" fill="${m}"/>`;
    else s += `<path d="${octagonPath(140, 134, 46)}" fill="${m}" stroke="${m}" stroke-width="22" stroke-linejoin="round"/>`;
    // coroa do lado esquerdo (vista de trás)
    s += `<rect x="${400 - caseRight(c) - 22}" y="${CY - 16}" width="26" height="32" rx="5" fill="${m}"/>`;
    s += `<circle cx="${CX}" cy="${CY}" r="124" fill="url(#${u}-polish)"/>`;
    for (let i = 0; i < 90; i++) {
      const [x1, y1] = polar(124, i * 4);
      const [x2, y2] = polar(119, i * 4);
      s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${shade(c.caseColor, -0.45)}" stroke-opacity=".6" stroke-width="1.4"/>`;
    }
    if (c.movement === "quartzo" || c.displayBack === false) {
      // fundo fechado
      s += `<circle cx="${CX}" cy="${CY}" r="112" fill="${m}"/>`;
      for (let r = 20; r < 110; r += 6) s += `<circle cx="${CX}" cy="${CY}" r="${r}" fill="none" stroke="#fff" stroke-opacity=".08"/>`;
      s += wings(CX, CY - 34, 84, shade(c.caseColor, -0.5));
      s += `<text x="${CX}" y="${CY - 2}" text-anchor="middle" font-family="Saira, sans-serif" font-size="15" font-weight="500" letter-spacing="2.4" fill="${shade(c.caseColor, -0.55)}">Ferraro Atelier</text>`;
      s += `<text x="${CX}" y="${CY + 14}" text-anchor="middle" font-family="Saira, sans-serif" font-size="8" letter-spacing="2" fill="${shade(c.caseColor, -0.5)}">${MOVEMENT_LABEL[c.movement]} · AÇO · 100 M</text>`;
    } else {
      s += `<circle cx="${CX}" cy="${CY}" r="112" fill="${m}"/>`;
      s += `<path id="${u}-arc" d="M${CX - 103} ${CY} A103 103 0 0 1 ${CX + 103} ${CY}" fill="none"/>`;
      s += `<text font-family="Saira, sans-serif" font-size="9.5" letter-spacing="1.6" fill="${shade(c.caseColor, -0.6)}"><textPath href="#${u}-arc" startOffset="50%" text-anchor="middle">Ferraro Atelier · relojoaria sob encomenda</textPath></text>`;
      s += `<circle cx="${CX}" cy="${CY}" r="92" fill="#0d0f12"/>`;
      s += movement(u, c, 90);
      s += `<circle cx="${CX}" cy="${CY}" r="91" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>`;
      s += `<ellipse cx="${CX - 30}" cy="${CY - 50}" rx="55" ry="26" fill="#fff" opacity=".08" transform="rotate(-30 ${CX - 30} ${CY - 50})"/>`;
    }
    return wrap(u, c, s, "Fundo do relógio");
  }

  /** Ícone de um estilo de ponteiro, para os botões de escolha. */
  function handIcon(style, color = "#141b26") {
    const c = { ...DEFAULT_WATCH, handColor: color, lume: false, caseShape: "redonda" };
    return `<svg viewBox="140 160 120 130" aria-hidden="true"><g transform="rotate(-50 200 260)">${hand(style, "h", c)}</g><g transform="rotate(48 200 260)">${hand(style, "m", c)}</g><circle cx="200" cy="260" r="4" fill="${color}"/></svg>`;
  }

  return { front, back, layers, handIcon, wings, mark, hand, secondHand, shade, ink, mix, hexToRgb, rgbToHex, luminance };
})();

// ---------------------------------------------------------------------------
// Movimento: faz os ponteiros andarem conforme o tipo de máquina.
// quartzo: um salto por segundo · automático e manual: 6 batidas por segundo
// (21.600 alternâncias/h). Automático e manual param quando acaba a corda.
// ---------------------------------------------------------------------------
const DEMO_RESERVE_SECONDS = 120; // demonstração acelerada: a reserva toda dura 2 minutos

class Movement {
  constructor(root, cfg, { onState } = {}) {
    this.root = root;
    this.cfg = cfg;
    this.type = cfg.movement;
    this.reserve = 0.6;
    this.offset = 0;          // ms em que o relógio ficou parado
    this.stoppedAt = null;
    this.rotor = 0;
    this.rotorVel = 0;
    this.ratchet = 0;
    this.knurl = 0;
    this.chrono = { running: false, start: 0, elapsed: 0 };
    this.onState = onState;
    this.last = performance.now();
    this.bind();
  }

  setConfig(cfg) {
    const typeChanged = cfg.movement !== this.type;
    this.cfg = cfg;
    this.type = cfg.movement;
    if (typeChanged) { this.offset = 0; this.stoppedAt = null; this.reserve = Math.max(this.reserve, 0.6); }
    this.bind();
  }

  bind() {
    const q = (sel) => [...this.root.querySelectorAll(sel)];
    this.el = {
      h: q('[data-hand="h"]'), m: q('[data-hand="m"]'), s: q('[data-hand="s"]'),
      chrono: q('[data-hand="chrono"]'), sub: q('[data-hand="sub"]'), cm: q('[data-hand="cm"]'), ch: q('[data-hand="ch"]'),
      rotor: q("[data-rotor]"), balance: q("[data-balance]"), ratchet: q("[data-ratchet]"), knurl: q("[data-knurl]"),
    };
  }

  get mechanical() { return this.cfg.movement !== "quartzo"; }
  get running() { return !this.mechanical || this.reserve > 0; }

  wind(amount) {
    if (!this.mechanical) return;
    this.reserve = Math.min(1, this.reserve + amount);
    this.ratchet += amount * 900;
    this.knurl = (this.knurl + amount * 160) % 4;
  }

  shake(amount) {
    if (this.cfg.movement !== "automatico") return;
    this.rotorVel += amount * 2.2;
    this.reserve = Math.min(1, this.reserve + Math.abs(amount) * 0.0005);
  }

  resetTime() { this.offset = 0; if (this.stoppedAt) this.stoppedAt = performance.now(); }

  pusher(role) {
    const ch = this.chrono;
    if (role === "start") {
      if (ch.running) { ch.elapsed += performance.now() - ch.start; ch.running = false; }
      else { ch.start = performance.now(); ch.running = true; }
    } else if (!ch.running) ch.elapsed = 0;
  }

  tick(now) {
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    const wasRunning = this.running;
    if (this.mechanical && this.reserve > 0) this.reserve = Math.max(0, this.reserve - dt / DEMO_RESERVE_SECONDS);

    if (!this.running && this.stoppedAt === null) this.stoppedAt = now;
    if (this.running && this.stoppedAt !== null) { this.offset += now - this.stoppedAt; this.stoppedAt = null; }
    if (wasRunning !== this.running) this.onState?.(this);

    const t = new Date(Date.now() - this.offset - (this.stoppedAt !== null ? now - this.stoppedAt : 0));
    const ms = t.getMilliseconds() / 1000;
    let sec = t.getSeconds() + ms;
    // quartzo: 1 passo/s · NH35 e ST3600: 6 passos/s (21.600/h) · Sellita suíço: 8 passos/s (28.800/h)
    const steps = this.cfg.movement === "quartzo" ? 1 : this.cfg.swiss ? 8 : 6;
    sec = Math.floor(sec * steps) / steps;
    const min = t.getMinutes() + sec / 60;
    const hr = (t.getHours() % 12) + min / 60;

    const rot = (els, deg, cx = 200, cy = 260) => els.forEach((e) => e.setAttribute("transform", `rotate(${deg.toFixed(2)} ${e.dataset.cx || cx} ${e.dataset.cy || cy})`));
    rot(this.el.h, hr * 30);
    rot(this.el.m, min * 6);
    rot(this.el.s, sec * 6);
    rot(this.el.sub, sec * 6);
    const ch = this.chrono;
    const el = (ch.elapsed + (ch.running ? now - ch.start : 0)) / 1000;
    rot(this.el.chrono, (el % 60) * 6);
    rot(this.el.cm, ((el / 60) % 30) * 12);
    rot(this.el.ch, ((el / 3600) % 12) * 30);

    // rotor com inércia; balanço oscilando a 3 Hz enquanto há corda
    this.rotorVel *= Math.pow(0.12, dt);
    this.rotor += this.rotorVel * dt * 60;
    if (this.cfg.movement === "automatico" && Math.abs(this.rotorVel) > 0.2) this.reserve = Math.min(1, this.reserve + Math.abs(this.rotorVel) * dt * 0.004);
    rot(this.el.rotor, this.rotor);
    const swing = this.running ? Math.sin(now / 1000 * Math.PI * 2 * (this.cfg.swiss ? 4 : 3)) * 160 : 0;
    rot(this.el.balance, swing);
    rot(this.el.ratchet, this.ratchet);
    this.el.knurl.forEach((k) => k.setAttribute("transform", `translate(0 ${this.knurl.toFixed(2)})`));
  }
}

/** Um único laço de animação para todos os relógios da página. */
const Clockwork = {
  items: new Set(),
  started: false,
  add(m) { this.items.add(m); this.start(); return m; },
  remove(m) { this.items.delete(m); },
  start() {
    if (this.started) return;
    this.started = true;
    const loop = (now) => { this.items.forEach((m) => { if (m.root.isConnected) m.tick(now); else this.items.delete(m); }); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  },
};
