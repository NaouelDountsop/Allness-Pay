// import { Test, TestingModule } from '@nestjs/testing';
// import { TranzakService } from './tranzak.service';
// import { TransactionsService } from '../../modules/transactions/transactions.service';
// import { ConfigService } from '@nestjs/config';

// describe('TranzakService', () => {
//   let service: TranzakService;
//   let mockTransactionsService: Partial<TransactionsService>;
//   let mockConfigService: Partial<ConfigService>;

//   beforeEach(async () => {
//     mockTransactionsService = {
//       recordExternalPayment: jest.fn(),
//       confirmExternalPayment: jest.fn(),
//     };

//     mockConfigService = {
//       getOrThrow: jest.fn().mockReturnValue({
//         baseUrl: 'https://sandbox.dsapi.tranzak.me',
//         appId: 'test-app-id',
//         appKey: 'test-app-key',
//       }),
//     };

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         TranzakService,
//         { provide: TransactionsService, useValue: mockTransactionsService },
//         { provide: ConfigService, useValue: mockConfigService },
//       ],
//     }).compile();

//     service = module.get<TranzakService>(TranzakService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('handleCallback', () => {
//     it('should call confirmExternalPayment with COMPLETED status when SUCCESS', async () => {
//       const mockTransaction = { id: 'test-id', status: 'completed' };
//       (mockTransactionsService.confirmExternalPayment as jest.Mock).mockResolvedValue(mockTransaction);

//       const result = await service.handleCallback('test-id', 'SUCCESS');

//       expect(mockTransactionsService.confirmExternalPayment).toHaveBeenCalledWith(
//         'test-id',
//         'completed',
//       );
//       expect(result).toEqual(mockTransaction);
//     });

//     it('should call confirmExternalPayment with FAILED status when not SUCCESS', async () => {
//       const mockTransaction = { id: 'test-id', status: 'failed' };
//       (mockTransactionsService.confirmExternalPayment as jest.Mock).mockResolvedValue(mockTransaction);

//       const result = await service.handleCallback('test-id', 'FAILED');

//       expect(mockTransactionsService.confirmExternalPayment).toHaveBeenCalledWith(
//         'test-id',
//         'failed',
//       );
//       expect(result).toEqual(mockTransaction);
//     });
//   });
// });
