using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Authorization.Users;
using Abp.Domain.Repositories;
using Abp.Extensions;
using Abp.Linq.Extensions;
using Abp.Runtime.Session;
using Abp.UI;
using HelpDesk.Authorization.Users;
using HelpDesk.Issues.Dto;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;

namespace HelpDesk.Issues
{
    public class IssuesCommentsAppService :
        AsyncCrudAppService<
            IssuesComments,           // Entity
            IssuesCommentsDto,        // DTO
            long,                     // Primary key
            GetAllIssuesCommentsInput, // GetAll input
            CreateIssuesCommentsInput, // Create input
            UpdateIssuesCommentsInput  // Update input
        >,
        IIssuesCommentsAppService
    {
        private readonly ILogger<IssuesCommentsAppService> _logger;
        private readonly IAbpSession _abpSession;
        private readonly IRepository<Issues, long> _issuesRepository;
        private readonly IRepository<User, long> _userRepository;
        private readonly string _uploadPath;

        public IssuesCommentsAppService(
            IRepository<IssuesComments, long> repository,
            IRepository<Issues, long> issuesRepository,
            IRepository<User, long> userRepository,
            ILogger<IssuesCommentsAppService> logger,
            IAbpSession abpSession)
            : base(repository)
        {
            _logger = logger;
            _abpSession = abpSession;
            _issuesRepository = issuesRepository;
            _userRepository = userRepository;
            _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
            try
            {
                Directory.CreateDirectory(_uploadPath);
                _logger.LogInformation("Uploads directory ensured at {UploadPath}", _uploadPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create uploads directory at {UploadPath}", _uploadPath);
                throw new UserFriendlyException("Failed to initialize uploads directory.", ex);
            }
        }

        private async Task<(string FilePath, string FileName)> SaveFileAsync(IFormFile file)
        {
            _logger.LogInformation("Starting SaveFileAsync for file: {FileName}, Size: {FileSize} bytes", file?.FileName, file?.Length);

            if (file == null || file.Length == 0)
            {
                _logger.LogError("No file provided or file is empty.");
                throw new UserFriendlyException("No file provided or file is empty.");
            }

            if (file.Length > 10 * 1024 * 1024)
            {
                _logger.LogError("File size {FileSize} exceeds 10MB limit for file: {FileName}", file.Length, file.FileName);
                throw new UserFriendlyException("File size exceeds 10MB limit.");
            }

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".pdf", ".docx" };
            var extension = Path.GetExtension(file.FileName)?.ToLowerInvariant();
            if (string.IsNullOrEmpty(extension) || !allowedExtensions.Contains(extension))
            {
                _logger.LogError("Invalid file extension {Extension} for file: {FileName}", extension, file.FileName);
                throw new UserFriendlyException($"File type {extension} is not allowed.");
            }

            var fileName = $"{Guid.NewGuid()}{extension}";
            var filePath = Path.Combine(_uploadPath, fileName);

            try
            {
                _logger.LogInformation("Checking directory permissions for {FilePath}", filePath);
                var directory = Path.GetDirectoryName(filePath);
                if (!Directory.Exists(directory))
                {
                    Directory.CreateDirectory(directory);
                    _logger.LogInformation("Created directory {Directory}", directory);
                }

                var testFile = Path.Combine(directory, "test.txt");
                try
                {
                    File.WriteAllText(testFile, "test");
                    File.Delete(testFile);
                    _logger.LogInformation("Directory {Directory} is writable", directory);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Directory {Directory} is not writable", directory);
                    throw new UserFriendlyException($"Cannot write to directory {directory}.", ex);
                }

                _logger.LogInformation("Opening FileStream for {FilePath}", filePath);
                using (var stream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None, bufferSize: 4096, useAsync: true))
                {
                    _logger.LogInformation("Copying file {FileName} to {FilePath}", file.FileName, filePath);
                    await file.CopyToAsync(stream).ConfigureAwait(false);
                    _logger.LogInformation("File copied successfully to {FilePath}", filePath);
                }

                _logger.LogInformation("File saved successfully at {FilePath}", filePath);
                return ($"/Uploads/{fileName}", file.FileName);
            }
            catch (IOException ex)
            {
                _logger.LogError(ex, "IO error while saving file {FileName} to {FilePath}", file.FileName, filePath);
                throw new UserFriendlyException("Error saving file due to IO issue.", ex);
            }
            catch (UnauthorizedAccessException ex)
            {
                _logger.LogError(ex, "Permission denied while saving file {FileName} to {FilePath}", file.FileName, filePath);
                throw new UserFriendlyException("Permission denied while saving file.", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while saving file {FileName} to {FilePath}", file.FileName, filePath);
                throw new UserFriendlyException("Unexpected error while saving file.", ex);
            }
        }

        private async Task DeleteFileAsync(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
            {
                _logger.LogWarning("No file path provided for deletion.");
                return;
            }

            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", filePath.TrimStart('/'));
            if (File.Exists(fullPath))
            {
                try
                {
                    _logger.LogInformation("Attempting to delete file at {FilePath}", fullPath);
                    File.Delete(fullPath);
                    _logger.LogInformation("File deleted successfully: {FilePath}", fullPath);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error deleting file: {FilePath}", fullPath);
                }
            }
            else
            {
                _logger.LogWarning("File not found for deletion: {FilePath}", fullPath);
            }
        }

        public async Task<FileResult> GetFileAsync(EntityDto<long> input)
        {
            CheckGetPermission();

            _logger.LogInformation("Retrieving file for comment ID: {CommentId}", input.Id);
            var comment = await Repository.GetAsync(input.Id).ConfigureAwait(false);
            if (comment == null)
            {
                _logger.LogError("Comment with ID {CommentId} not found.", input.Id);
                throw new UserFriendlyException($"Comment with ID {input.Id} not found.");
            }

            if (string.IsNullOrWhiteSpace(comment.FilePath))
            {
                _logger.LogError("No file associated with comment ID {CommentId}.", input.Id);
                throw new UserFriendlyException($"No file associated with comment ID {input.Id}.");
            }

            var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", comment.FilePath.TrimStart('/'));
            if (!File.Exists(fullPath))
            {
                _logger.LogError("File not found at {FilePath} for comment ID {CommentId}.", comment.FilePath, input.Id);
                throw new UserFriendlyException($"File not found at {comment.FilePath}.");
            }

            try
            {
                var fileBytes = await File.ReadAllBytesAsync(fullPath).ConfigureAwait(false);
                var fileExtension = Path.GetExtension(comment.FileName).ToLowerInvariant();
                var contentType = fileExtension switch
                {
                    ".jpg" => "image/jpeg",
                    ".jpeg" => "image/jpeg",
                    ".png" => "image/png",
                    ".pdf" => "application/pdf",
                    ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    _ => "application/octet-stream"
                };

                _logger.LogInformation("Serving file {FilePath} for comment ID {CommentId}", comment.FilePath, input.Id);
                return new FileContentResult(fileBytes, contentType) { FileDownloadName = comment.FileName };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading file {FilePath} for comment ID {CommentId}", comment.FilePath, input.Id);
                throw new UserFriendlyException("Error reading file.", ex);
            }
        }

        public async Task<IssuesCommentsDto> CreateCommentWithFileAsync(long commentId, IFormFile file)
        {
            CheckCreatePermission();

            _logger.LogInformation("Starting CreateCommentWithFileAsync for CommentId: {CommentId}", commentId);

            if (file == null)
            {
                _logger.LogError("File is null for CommentId: {CommentId}", commentId);
                throw new UserFriendlyException("File must be provided.");
            }

            _logger.LogInformation("Fetching comment with ID: {CommentId}", commentId);
            var comment = await Repository.GetAsync(commentId).ConfigureAwait(false);
            if (comment == null)
            {
                _logger.LogError("Comment with ID {CommentId} not found.", commentId);
                throw new UserFriendlyException($"Comment with ID {commentId} not found.");
            }

            _logger.LogInformation("Calling SaveFileAsync for CommentId: {CommentId}", commentId);
            var (filePath, fileName) = await SaveFileAsync(file);

            comment.FilePath = filePath;
            comment.FileName = fileName;
            comment.TenantId = _abpSession.TenantId;

            _logger.LogInformation("Updating comment with ID: {CommentId}", commentId);
            await Repository.UpdateAsync(comment).ConfigureAwait(false);
            _logger.LogInformation("Comment updated with file for CommentId: {CommentId}, FilePath: {FilePath}", commentId, filePath);

            _logger.LogInformation("Mapping comment to DTO for CommentId: {CommentId}", commentId);
            var result = await MapToDtoWithUsersAsync(comment);
            _logger.LogInformation("Returning comment DTO with ID: {CommentId}, IssueId: {IssueId}, FilePath: {FilePath}", result.Id, result.IssueId, result.FilePath);
            return result;
        }

        public async Task<IssuesCommentsDto> UpdateCommentWithFileAsync(long commentId, IFormFile file)
        {
            CheckUpdatePermission();

            _logger.LogInformation("Starting UpdateCommentWithFileAsync for CommentId: {CommentId}", commentId);

            if (file == null)
            {
                _logger.LogError("File is null for CommentId: {CommentId}", commentId);
                throw new UserFriendlyException("File must be provided.");
            }

            _logger.LogInformation("Fetching comment with ID: {CommentId}", commentId);
            var comment = await Repository.GetAsync(commentId).ConfigureAwait(false);
            if (comment == null)
            {
                _logger.LogError("Comment with ID {CommentId} not found.", commentId);
                throw new UserFriendlyException($"Comment with ID {commentId} not found.");
            }

            if (!string.IsNullOrWhiteSpace(comment.FilePath))
            {
                _logger.LogInformation("Deleting existing file for CommentId: {CommentId}", commentId);
                await DeleteFileAsync(comment.FilePath);
            }

            _logger.LogInformation("Calling SaveFileAsync for CommentId: {CommentId}", commentId);
            var (filePath, fileName) = await SaveFileAsync(file);
            comment.FilePath = filePath;
            comment.FileName = fileName;
            comment.TenantId = _abpSession.TenantId;

            _logger.LogInformation("Updating comment with ID: {CommentId}", commentId);
            await Repository.UpdateAsync(comment).ConfigureAwait(false);
            _logger.LogInformation("Updated comment DTO with ID: {CommentId}, FilePath: {FilePath}", commentId, filePath);

            var result = await MapToDtoWithUsersAsync(comment);
            _logger.LogInformation("Returning updated comment DTO with ID: {CommentId}, FilePath: {FilePath}", result.Id, result.FilePath);
            return result;
        }

        public override async Task<IssuesCommentsDto> CreateAsync(CreateIssuesCommentsInput input)
        {
            CheckCreatePermission();

            _logger.LogInformation("Starting CreateAsync for IssueId: {IssueId}", input.IssueId);

            if (string.IsNullOrWhiteSpace(input.Content))
            {
                _logger.LogError("Comment content is empty for IssueId: {IssueId}", input.IssueId);
                throw new UserFriendlyException("Comment content must be provided.");
            }

            var issue = await _issuesRepository.FirstOrDefaultAsync(input.IssueId).ConfigureAwait(false);
            if (issue == null)
            {
                _logger.LogError("Issue with ID {IssueId} not found.", input.IssueId);
                throw new UserFriendlyException($"Issue with ID {input.IssueId} not found.");
            }

            var comment = ObjectMapper.Map<IssuesComments>(input);
            comment.TenantId = _abpSession.TenantId;

            _logger.LogInformation("Inserting new comment for IssueId: {IssueId}", input.IssueId);
            var commentId = await Repository.InsertAndGetIdAsync(comment).ConfigureAwait(false);
            _logger.LogInformation("Comment created with ID: {CommentId}, IssueId: {IssueId}", commentId, input.IssueId);

            var savedComment = await Repository.FirstOrDefaultAsync(c => c.Id == commentId).ConfigureAwait(false);
            if (savedComment == null)
            {
                _logger.LogError("Failed to retrieve comment with ID {CommentId} after creation.", commentId);
                throw new UserFriendlyException($"Failed to retrieve comment with ID {commentId} after creation.");
            }

            var result = await MapToDtoWithUsersAsync(savedComment);
            _logger.LogInformation("Returning comment DTO with ID: {CommentId}, IssueId: {IssueId}", result.Id, result.IssueId);
            return result;
        }

        public override async Task<IssuesCommentsDto> UpdateAsync(UpdateIssuesCommentsInput input)
        {
            CheckUpdatePermission();

            _logger.LogInformation("Starting UpdateAsync for CommentId: {CommentId}", input.Id);

            if (string.IsNullOrWhiteSpace(input.Content))
            {
                _logger.LogError("Comment content is empty for CommentId: {CommentId}", input.Id);
                throw new UserFriendlyException("Comment content must be provided.");
            }

            var comment = await Repository.GetAsync(input.Id).ConfigureAwait(false);
            if (comment == null)
            {
                _logger.LogError("Comment with ID {CommentId} not found.", input.Id);
                throw new UserFriendlyException($"Comment with ID {input.Id} not found.");
            }

            ObjectMapper.Map(input, comment);
            comment.TenantId = _abpSession.TenantId;

            await Repository.UpdateAsync(comment).ConfigureAwait(false);
            var result = await MapToDtoWithUsersAsync(comment);
            _logger.LogInformation("Updated comment DTO with ID: {CommentId}", result.Id);
            return result;
        }

        public override async Task DeleteAsync(EntityDto<long> input)
        {
            CheckDeletePermission();

            _logger.LogInformation("Starting DeleteAsync for CommentId: {CommentId}", input.Id);

            var comment = await Repository.GetAsync(input.Id).ConfigureAwait(false);
            if (comment == null)
            {
                _logger.LogError("Comment with ID {CommentId} not found.", input.Id);
                throw new UserFriendlyException($"Comment with ID {input.Id} not found.");
            }

            if (!string.IsNullOrWhiteSpace(comment.FilePath))
            {
                _logger.LogInformation("Deleting file for CommentId: {CommentId}", input.Id);
                await DeleteFileAsync(comment.FilePath);
            }

            await Repository.DeleteAsync(input.Id).ConfigureAwait(false);
            _logger.LogInformation("Comment deleted with ID: {CommentId}", input.Id);
        }

        public override async Task<IssuesCommentsDto> GetAsync(EntityDto<long> input)
        {
            CheckGetPermission();

            _logger.LogInformation("Starting GetAsync for CommentId: {CommentId}", input.Id);

            var comment = await GetEntityByIdAsync(input.Id).ConfigureAwait(false);
            var result = await MapToDtoWithUsersAsync(comment);
            _logger.LogInformation("Retrieved comment DTO with ID: {CommentId}", result.Id);
            return result;
        }

        public async Task<IssuesCommentsDto> GetCommentForEdit(EntityDto<long> input)
        {
            CheckGetPermission();

            _logger.LogInformation("Starting GetCommentForEdit for CommentId: {CommentId}", input.Id);

            var comment = await GetEntityByIdAsync(input.Id).ConfigureAwait(false);
            var result = await MapToDtoWithUsersAsync(comment);
            _logger.LogInformation("Retrieved comment for edit with ID: {CommentId}", result.Id);
            return result;
        }

        public override async Task<PagedResultDto<IssuesCommentsDto>> GetAllAsync(GetAllIssuesCommentsInput input)
        {
            CheckGetAllPermission();

            _logger.LogInformation("Retrieving comments with Filter: {Keyword}, IssueId: {IssueId}", input.Keyword, input.IssueId);

            var query = CreateFilteredQuery(input);
            query = ApplySorting(query, input);

            var totalCount = await query.CountAsync().ConfigureAwait(false);
            var items = await query
                .PageBy(input)
                .ToListAsync().ConfigureAwait(false);

            var dtos = new List<IssuesCommentsDto>();
            foreach (var item in items)
            {
                dtos.Add(await MapToDtoWithUsersAsync(item));
            }

            _logger.LogInformation("Retrieved {Count} comments", totalCount);
            return new PagedResultDto<IssuesCommentsDto>(totalCount, dtos);
        }

        private async Task<IssuesCommentsDto> MapToDtoWithUsersAsync(IssuesComments comment)
        {
            var dto = ObjectMapper.Map<IssuesCommentsDto>(comment);

            // Foydalanuvchi nomlarini olish
            if (comment.CreatorUserId.HasValue)
            {
                var creator = await _userRepository.FirstOrDefaultAsync(u => u.Id == comment.CreatorUserId.Value).ConfigureAwait(false);
                dto.CreatorFullName = creator != null ? $"{creator.Name} {creator.Surname}" : null;
            }

            if (comment.LastModifierUserId.HasValue)
            {
                var lastModifier = await _userRepository.FirstOrDefaultAsync(u => u.Id == comment.LastModifierUserId.Value).ConfigureAwait(false);
                dto.LastModifierFullName = lastModifier != null ? $"{lastModifier.Name} {lastModifier.Surname}" : null;
            }

            if (comment.DeleterUserId.HasValue)
            {
                var deleter = await _userRepository.FirstOrDefaultAsync(u => u.Id == comment.DeleterUserId.Value).ConfigureAwait(false);
                dto.DeleterFullName = deleter != null ? $"{deleter.Name} {deleter.Surname}" : null;
            }

            return dto;
        }

        protected override IQueryable<IssuesComments> CreateFilteredQuery(GetAllIssuesCommentsInput input)
        {
            var query = Repository.GetAll();

            if (!input.Keyword.IsNullOrWhiteSpace())
            {
                query = query.Where(c => c.Content.Contains(input.Keyword));
            }

            if (input.IssueId.HasValue)
            {
                query = query.Where(c => c.IssueId == input.IssueId.Value);
            }

            var tenantId = _abpSession.TenantId;
            query = query.WhereIf(tenantId.HasValue, c => c.TenantId == tenantId);

            return query;
        }

        protected override IQueryable<IssuesComments> ApplySorting(IQueryable<IssuesComments> query, GetAllIssuesCommentsInput input)
        {
            var sorting = string.IsNullOrWhiteSpace(input.Sorting) ? "CreationTime DESC" : input.Sorting;
            return query.OrderBy(sorting);
        }

        protected override async Task<IssuesComments> GetEntityByIdAsync(long id)
        {
            var comment = await Repository.GetAll()
                .FirstOrDefaultAsync(x => x.Id == id).ConfigureAwait(false);
            if (comment == null)
            {
                _logger.LogError("Comment with ID {CommentId} not found.", id);
                throw new UserFriendlyException($"Comment with ID {id} not found.");
            }
            return comment;
        }
    }
}