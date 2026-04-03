import { HttpContextToken } from '@angular/common/http';

export const SKIP_GLOBAL_HTTP_ERROR_HANDLING = new HttpContextToken<boolean>(() => false);
