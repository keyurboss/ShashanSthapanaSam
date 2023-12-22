import { AfterViewInit, Component, HostListener } from '@angular/core';
import Cropper from 'cropperjs';
import { toJpeg, toPng } from 'html-to-image';
import {
  BehaviorSubject,
  Observable,
  debounceTime,
  delay,
  firstValueFrom,
  map,
  of,
} from 'rxjs';
import { Name, rou } from './Data';
import imageCompression, { Options } from 'browser-image-compression';
import { AsyncPipe } from '@angular/common';

const IdCardPreviewDataID = 'IDCARDDEMo';
@Component({
  standalone: true,
  imports: [AsyncPipe],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  height = 0;
  width = 0;

  HeightWidthBrhaviouSubject = new BehaviorSubject<void>('' as any);
  private _orignalImage = '';
  _LoaderObse!: Observable<boolean>;
  ShowLoader = new BehaviorSubject(false);
  public get orignalImage() {
    return this._orignalImage;
  }
  public set orignalImage(value) {
    this.showCropper = true;
    this._orignalImage = value;
  }

  cropperInstance!: Cropper;
  roundedImage = rou;
  showCropper = false;
  finalImage = '';
  YourName = Name;
  constructor() {
    this._LoaderObse = this.ShowLoader.pipe(map((a) => !a));
    this.init();
  }
  ngAfterViewInit(): void {
    // const myCanvas = document.getElementById('mycanvas') as HTMLCanvasElement;
    // const myContext = myCanvas.getContext('2d');
    // if(myContext !== null){
    //   myContext.drawImage('/assets/SankalPatra.jpg', 0, 0);
    // }
    // if (e !== null) {
    //   new Cropper(e, {
    //     aspectRatio: 1,
    //     viewMode: 1,
    //     ready: function () {
    //       debugger;
    //       // croppable = true;
    //     },
    //   });
    // }
  }
  private init() {
    console.log('Vanilla Service on FE');
    this.HeightWidthBrhaviouSubject.pipe(debounceTime(50)).subscribe(() => {
      if (
        this.width !== window.innerWidth ||
        Math.abs(this.height - window.innerHeight) < 40
      ) {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        document.documentElement.style.setProperty('--vh', this.height + 'px');
        document.documentElement.style.setProperty('--vw', this.width + 'px');
      }
    });
  }

  getRoundedCanvas(sourceCanvas: HTMLCanvasElement) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (context === null || canvas === null) {
      return;
    }
    const width = sourceCanvas.width;
    const height = sourceCanvas.height;
    console.log(width, height);

    canvas.width = width;
    canvas.height = height;
    context.imageSmoothingEnabled = true;
    context.drawImage(sourceCanvas, 0, 0, width, height);
    context.globalCompositeOperation = 'destination-in';
    context.beginPath();
    // context.arc(
    //   width / 2,
    //   height / 2,
    //   Math.min(width, height) / 2,
    //   0,
    //   2 * Math.PI,
    //   true
    // );
    context.fill();
    return canvas;
  }

  @HostListener('window:resize')
  onResize() {
    this.HeightWidthBrhaviouSubject.next();
  }

  async OnFielChangeEvent(event: Event) {
    const target = event.target as any;
    const files = target.files;
    if (files.length === 0) return;

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      alert('Only images are supported.');
      return;
    }
    this.ShowLoader.next(true);
    const imageFile = files[0];
    const controller = new AbortController();

    const options: Options = {
      // other options here
      maxWidthOrHeight: 1000,
      signal: controller.signal,
    };
    const compressedFile = await imageCompression(imageFile, options);

    // simulate abort the compression after 1.5 seconds
    setTimeout(function () {
      controller.abort(new Error('I just want to stop'));
    }, 1500);
    const reader = new FileReader();
    // this.imagePath = files;
    reader.readAsDataURL(compressedFile);
    reader.onload = (_event) => {
      this.orignalImage = reader.result ? reader.result?.toString() : '';
      // this.url = reader.result;
      setTimeout(() => {
        this.createCropper();
      }, 1);
    };
  }
  createCropper() {
    const e = document.getElementById('imageshowcase');
    if (e !== null && e instanceof HTMLImageElement) {
      this.cropperInstance = new Cropper(e, {
        aspectRatio: 0.741173,
        viewMode: 1,
        ready: () => {
          this.ShowLoader.next(false);
        },
        center: true,
      });
    }
  }

  async cropClick() {
    this.ShowLoader.next(true);
    await firstValueFrom(of('').pipe(delay(100)));
    if (!this.cropperInstance) {
      alert('Something went wrong');
      this.orignalImage = '';
      return;
    }
    // Crop
    const croppedCanvas = this.cropperInstance.getCroppedCanvas();

    // Round
    const roundedCanvas = croppedCanvas;
    // const roundedCanvas = this.getRoundedCanvas(croppedCanvas);
    if (roundedCanvas) {
      this.roundedImage = roundedCanvas.toDataURL();
      console.log(this.roundedImage);
      this.showCropper = false;
    }
    this.ShowLoader.next(false);
  }
  async CreateSnkalp() {
    const IdCardNode = document.getElementById(IdCardPreviewDataID);
    if (IdCardNode === null) {
      return;
    }
    this.ShowLoader.next(true);
    IdCardNode.style.display = 'block';
    // IdCardNode.style.zIndex = '10';
    await firstValueFrom(of('').pipe(delay(1000)));
    scrollTo({
      behavior: 'auto',
      left: 0,
      top: 0,
    });
    var ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('safari') != -1) {
      if (ua.indexOf('chrome') === -1) {
        // alert('2'); // Safari
        let data = await toPng(IdCardNode);
        while (data.length < 100000) {
          data = await toPng(IdCardNode);
        }
        // await toJpeg(IdCardNode);
        // await toJpeg(IdCardNode);
        // await toJpeg(IdCardNode);
      }
    }
    const AAAA = await toJpeg(IdCardNode);
    this.finalImage = AAAA;
    this.ShowLoader.next(false);
    // IdCardNode.style.zIndex = '-10';
    IdCardNode.style.display = 'none';
  }
  downloadImage() {
    const link = document.createElement('a');
    link.download = `${this.YourName ?? 'card'}.jpeg`;
    link.href = this.finalImage;
    link.click();
  }
  async shareImage() {
    const filee = await this.urltoFile(
      this.finalImage,
      'card.jpeg',
      'image/jpeg'
    );
    const files = [filee];
    if (!navigator.canShare) {
      alert(`Your browser doesn't support the Web Share API.`);
      return;
    }
    if (navigator.canShare({ files })) {
      await navigator.share({
        files,
        // title: '',
        text: 'શાસન પ્રભાવનાની અમૂલ્ય તક',
      });
    }
  }
  urltoFile(url: string, filename: string, mimeType: string) {
    return fetch(url)
      .then(function (res) {
        return res.arrayBuffer();
      })
      .then(function (buf) {
        return new File([buf], filename, { type: mimeType });
      });
  }
}
