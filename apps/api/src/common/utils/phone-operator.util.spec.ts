// import { detectOperator } from './phone-operator.util';
// import { LinkedAccountOperator } from '../../modules/linked-account/enums/linked-account-operator.enum';

// describe('detectOperator', () => {
//   describe('MTN prefixes (650-659)', () => {
//     it.each(['650', '651', '652', '653', '654', '655', '656', '657', '658', '659'])(
//       'should detect MTN for prefix %s',
//       (prefix) => {
//         expect(detectOperator(`${prefix}123456`)).toBe(LinkedAccountOperator.MTN_MOMO);
//       },
//     );

//     it('should detect MTN with +237 prefix', () => {
//       expect(detectOperator('+237652123456')).toBe(LinkedAccountOperator.MTN_MOMO);
//     });

//     it('should detect MTN with 237 prefix', () => {
//       expect(detectOperator('237653123456')).toBe(LinkedAccountOperator.MTN_MOMO);
//     });
//   });

//   describe('Orange prefixes (690-699)', () => {
//     it.each(['690', '691', '692', '693', '694', '695', '696', '697', '698', '699'])(
//       'should detect Orange for prefix %s',
//       (prefix) => {
//         expect(detectOperator(`${prefix}123456`)).toBe(LinkedAccountOperator.ORANGE_MONEY);
//       },
//     );

//     it('should detect Orange with +237 prefix', () => {
//       expect(detectOperator('+237691123456')).toBe(LinkedAccountOperator.ORANGE_MONEY);
//     });

//     it('should detect Orange with 237 prefix', () => {
//       expect(detectOperator('237695123456')).toBe(LinkedAccountOperator.ORANGE_MONEY);
//     });
//   });

//   describe('invalid or unrecognized numbers', () => {
//     it('should return null for unknown prefix 680', () => {
//       expect(detectOperator('680123456')).toBeNull();
//     });

//     it('should return null for invalid format', () => {
//       expect(detectOperator('abc')).toBeNull();
//     });

//     it('should return null for too short number', () => {
//       expect(detectOperator('652')).toBeNull();
//     });

//     it('should return null for empty string', () => {
//       expect(detectOperator('')).toBeNull();
//     });
//   });

//   describe('number formats', () => {
//     it('should handle number with spaces', () => {
//       expect(detectOperator('652 123 456')).toBe(LinkedAccountOperator.MTN_MOMO);
//     });

//     it('should handle number with dashes', () => {
//       expect(detectOperator('691-123-456')).toBe(LinkedAccountOperator.ORANGE_MONEY);
//     });
//   });
// });
