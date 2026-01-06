// BonusSystemUserDto.cs
using Abp.Application.Services.Dto;
using Abp.AutoMapper;
using HelpDesk.BonusSystem;
using System;

namespace HelpDesk.BonusSystem.Dto
{
    [AutoMapFrom(typeof(BonusSystemUser))]
    public class BonusSystemUserDto : EntityDto<long>
    {
        public long BonusSystemId { get; set; }
        public string BonusSystemName { get; set; }
        public string BonusSystemDescription { get; set; }
        public decimal BonusSystemAmount { get; set; }
        public bool BonusSystemIsActive { get; set; }

        public long UserId { get; set; }
        public string UserFullName { get; set; }
        public string UserEmail { get; set; }
        public string UserName { get; set; }
        public string UserSurname { get; set; }

        public DateTime CreationTime { get; set; }
        public DateTime? LastModificationTime { get; set; }
    }

    [AutoMapTo(typeof(BonusSystemUser))]
    public class CreateBonusSystemUserDto
    {
        public long BonusSystemId { get; set; }
        public long UserId { get; set; }
    }

    [AutoMapTo(typeof(BonusSystemUser))]
    public class EditBonusSystemUserDto : EntityDto<long>
    {
        public long BonusSystemId { get; set; }
        public long UserId { get; set; }
    }

    public class GetAllBonusSystemUsersInput : PagedAndSortedResultRequestDto
    {
        public string Keyword { get; set; }
        public long? BonusSystemId { get; set; }
        public long? UserId { get; set; }
        public bool? IsActive { get; set; }
        public decimal? AmountMin { get; set; }
        public decimal? AmountMax { get; set; }
        public DateTime? CreationTimeStart { get; set; }
        public DateTime? CreationTimeEnd { get; set; }
    }
}