function saveScreeningJSON(result, outputFile)
%SAVESCREENINGJSON Save the clinically relevant scalar/label fields as JSON.
    if nargin<2 || isempty(outputFile)
        outputFile=fullfile(fileparts(mfilename('fullpath')),'results','screening_result.json');
    end
    out=result;
    fields={'enhancedImage','vesselMask','gradcam'};
    for i=1:numel(fields)
        if isfield(out,fields{i}), out=rmfield(out,fields{i}); end
    end
    txt=jsonencode(out,'PrettyPrint',true);
    fid=fopen(outputFile,'w');
    if fid<0, error('Could not open output file: %s',outputFile); end
    fwrite(fid,txt,'char'); fclose(fid);
end
