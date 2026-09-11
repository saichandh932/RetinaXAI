function mask = createCircularMask(imageSize)
%CREATECIRCULARMASK Create central retinal field mask.
    H=imageSize(1); W=imageSize(2); [X,Y]=meshgrid(1:W,1:H);
    cx=W/2; cy=H/2; radius=min(W,H)*0.48;
    mask=(X-cx).^2+(Y-cy).^2<=radius^2;
end
