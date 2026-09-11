%% RETINA-XAI MATLAB DIRECT EXECUTION TEST
% Run this file from MATLAB. It creates a synthetic fundus-like image,
% executes every available module, prints the result and saves outputs.

clear; clc; close all;
root=fileparts(mfilename('fullpath'));
addpath(root); addpath(fullfile(root,'utils'));

fprintf('\nRETINA-XAI MATLAB PIPELINE\n');
fprintf('===========================\n');

% Create a synthetic test image so the pipeline executes without a dataset.
N=768; [X,Y]=meshgrid(linspace(-1,1,N));
r=sqrt(X.^2+Y.^2);
retina=max(0,1-r);
R=0.25+0.35*retina; G=0.10+0.40*retina; B=0.08+0.28*retina;
I=cat(3,R,G,B);
I=I+0.02*randn(size(I)); I=min(max(I,0),1);
I(repmat(r>0.98,[1 1 3]))=0;

fprintf('1/8 Image quality...\n');
q=assessImageQuality(I); disp(q);
fprintf('2/8 Preprocessing...\n');
E=preprocessRetinalImage(I);
fprintf('3/8 Vessel segmentation...\n');
V=segmentRetinalVessels(E);
fprintf('4/8 Optic disc + fovea...\n');
OD=detectOpticDisc(E); F=detectFovea(E,OD);
fprintf('5/8 Lesion detection...\n');
MA=detectMicroaneurysms(E); EX=detectExudates(E); HE=detectHemorrhages(E); NV=detectNeovascularization(E,V,OD);
lesions=struct('microaneurysms',MA,'exudates',EX,'hemorrhages',HE,'neovascularization',NV,'vessels',struct('detected',nnz(V)>0),'opticDisc',OD,'fovea',F);
fprintf('6/8 Grading...\n');
S=gradeDiabeticRetinopathy(lesions,E);
fprintf('7/8 Referral + explainability...\n');
Ref=generateReferral(S,lesions,q); CAM=generateGradCAM(E);
fprintf('8/8 Completed.\n\n');

fprintf('GRADE: Level %d - %s\n',S.level,S.label);
fprintf('CONFIDENCE: %.1f%%\n',100*S.confidence);
fprintf('QUALITY: %d/100 (%s)\n',q.score,q.status);
fprintf('REFERRAL: %s (%s)\n',string(Ref.recommended),Ref.priority);

result=struct('quality',q,'severity',S,'confidence',S.confidence,'lesions',lesions,'referral',Ref,'gradcam',CAM,'enhancedImage',E,'vesselMask',V,'opticDisc',OD,'fovea',F);
if ~exist(fullfile(root,'results'),'dir'), mkdir(fullfile(root,'results')); end
save(fullfile(root,'results','demo_result.mat'),'result');
imwrite(E,fullfile(root,'results','demo_enhanced.png'));

figure('Name','RETINA-XAI Demo');
subplot(1,3,1); imshow(I); title('Input');
subplot(1,3,2); imshow(E); title('Preprocessed');
subplot(1,3,3); imshow(V); title('Vessel Mask');

fprintf('\nSaved: matlab/results/demo_result.mat\n');
fprintf('Saved: matlab/results/demo_enhanced.png\n');
