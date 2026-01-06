using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using static Microsoft.Extensions.Logging.EventSource.LoggingEventSource;

namespace HelpDesk.Services.Dto
{
    [AutoMapFrom(typeof(Services))]
    public class ServiceDto : EntityDto<int>
    {
        public string Name { get; set; }
        public int? TenantId { get; set; }
    }

    [AutoMapTo(typeof(Services))]
    public class CreateServiceInput
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
    }

    [AutoMapTo(typeof(Services))]
    public class UpdateServiceInput : EntityDto<int>
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
    }

    public class GetAllServiceInput : PagedAndSortedResultRequestDto
    {
        public string Keyword { get; set; }

        public void Normalize()
        {
            if (string.IsNullOrEmpty(Sorting))
            {
                Sorting = "Name,DisplayName";
            }

            Keyword = Keyword?.Trim();
        }
    }

    [AutoMapFrom(typeof(Services))]
    public class ServiceEditDto : EntityDto<int>
    {
        public string Name { get; set; }
    }

}