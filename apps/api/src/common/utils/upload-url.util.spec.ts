// import { buildPublicFileUrl } from './upload-url.util';

// describe('buildPublicFileUrl', () => {
//   it('builds an absolute URL from the incoming request host', () => {
//     const req = {
//       protocol: 'http',
//       get: (header: string) => (header === 'host' ? 'localhost:3000' : undefined),
//     } as any;

//     expect(buildPublicFileUrl(req, 'my-file.png', 'kyc')).toBe(
//       'http://localhost:3000/uploads/kyc/my-file.png',
//     );
//   });

//   it('keeps an already absolute URL unchanged', () => {
//     expect(buildPublicFileUrl({} as any, 'https://cdn.example.com/file.png', 'kyc')).toBe(
//       'https://cdn.example.com/file.png',
//     );
//   });
// });
