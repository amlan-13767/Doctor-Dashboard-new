export { default } from './middlewares';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/patients/:path*',
    '/api/patients/me',
    '/api/prescriptions/:path*',
    '/api/doctors/me',
    '/patient-dashboard/:path*',
    '/api/patient/:path*',
  ],
};
