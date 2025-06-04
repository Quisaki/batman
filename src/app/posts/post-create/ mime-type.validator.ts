import { AbstractControl } from '@angular/forms';
import { Observable, Observer } from 'rxjs';

export const mimetype = (
  control: AbstractControl
): Promise<{ [key: string]: any } | null> | Observable<{ [key: string]: any } | null> => {
  const file = control.value as File;
  if (typeof file === 'string') {
    // If the control value is a string (existing image URL), skip validation
    return new Promise((resolve) => resolve(null));
  }

  const fileReader = new FileReader();
  const frObs = new Observable((observer: Observer<{ [key: string]: any } | null>) => {
    fileReader.addEventListener('loadend', () => {
      // check the file header for mime type
      const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4);
      let header = '';
      for (let i = 0; i < arr.length; i++) {
        header += arr[i].toString(16);
      }
      let isValid = false;
      switch (header) {
        case '89504e47':
          isValid = true; // png
          break;
        case 'ffd8ffe0':
        case 'ffd8ffe1':
        case 'ffd8ffe2':
        case 'ffd8ffe3':
        case 'ffd8ffe8':
          isValid = true; // jpeg
          break;
        default:
          isValid = false; // invalid mime type
          break;
      }
      if (isValid) {
        observer.next(null);
      } else {
        observer.next({ invalidMimeType: true });
      }
      observer.complete();
    });
    fileReader.readAsArrayBuffer(file);

    // cleanup function
    return () => fileReader.abort();
  });
  return frObs;
};
