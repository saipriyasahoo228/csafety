import datetime
import base64
from django.conf import settings
from django.core.files.base import ContentFile
from django.utils.encoding import smart_bytes
from django.core.files.storage import FileSystemStorage
from rest_framework import generics, status
from rest_framework.response import Response
from accident.models import AccidentReporting
from ITEM.models import NewIssuance, IssuedToEmployee, IssuedThings
from accident.models import AccidentReport, AccidentWorkman, AccidentReporting,AccidentSupervisor,AccidentReportedBy
from trainings.models import Training
from .serializers import AccidentReportFilterSerializer

from rest_framework.views import APIView
from rest_framework.response import Response
def get_white_level_id_from_request(request):
    return request.user.whitelevel_id or None


def get_current_fiscal_year_start():
  """Returns the start date of the current fiscal year (April 1st)."""
  today = datetime.date.today()
  if today.month >= 4:
    # Current date is after April 1st, so current fiscal year starts on April 1st of the same year
    return datetime.date(today.year, 4, 1)
  else:
    # Current date is before April 1st, so current fiscal year starts on April 1st of the previous year
    return datetime.date(today.year - 1, 4, 1)


class DashboardAPIView(generics.GenericAPIView):
    def get(self, request):
        white_level_id = get_white_level_id_from_request(request)
        if white_level_id:
            response_data = {}
            fiscal_year_start_date = get_current_fiscal_year_start()

            issued_items = IssuedToEmployee.objects.filter(
                employee_id__whitelevel_id_id=white_level_id,
                issue_id__issuance_date__gte=fiscal_year_start_date
            ).select_related('employee_id', 'issue_id')

            upcoming_issuance_count = 0
            new_issuance = NewIssuance.objects.filter(
                white_level_id=white_level_id,
                issuance_date__gte=fiscal_year_start_date
            )
            for issuance in new_issuance:
                issuance_issued_things = IssuedThings.objects.filter(
                    issue_id=issuance.issuance_id,
                    expiry_date__lte=datetime.date.today() + datetime.timedelta(days=45)
                )
                upcoming_issuance_count += issuance_issued_things.count()

            accidents = AccidentReporting.objects.filter(
                whitelevel=white_level_id,
                accident_reporting_date__gte=fiscal_year_start_date
            )

            trainings = Training.objects.filter(
                whitelevel_id=white_level_id,
                training_date__gte=fiscal_year_start_date
            )

            response_data["issued_items_count"] = issued_items.count()
            response_data["upcoming_issuance_count"] = upcoming_issuance_count
            response_data["accidents_count"] = accidents.count()
            response_data["trainings_count"] = trainings.count()

            return Response({"data": response_data}, status=status.HTTP_200_OK)

        return Response("Unauthorized", status=status.HTTP_401_UNAUTHORIZED)







class AccidentReportListAPIView(APIView):
    def encode_image_to_base64(self, image):
        """Encodes the image to base64 format."""
        if image:
            file_system = FileSystemStorage(location=settings.MEDIA_ROOT)  # Use the file system storage
            file_path = file_system.path(image.name)  # Get the full file path
            try:
                with open(file_path, "rb") as img_file:
                    return base64.b64encode(img_file.read()).decode('utf-8')
            except FileNotFoundError:
                # Handle case where image file is not found
                return None
        return None
    
    def post(self, request, *args, **kwargs):
        serializer = AccidentReportFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Retrieve validated filtering criteria
        accident_type = serializer.validated_data.get('accident_type')
        severity_type = serializer.validated_data.get('severity_type')

        # Filter queryset
        queryset = AccidentReport.objects.all()
        if accident_type:
            queryset = queryset.filter(accident_type=accident_type)
        if severity_type:
            queryset = queryset.filter(severity=severity_type)

        # Prepare response data
        results = []
        for report in queryset:
            workmen_list = [
                {"employee_name": workman.employee_name, "employee_id": workman.employee_id or 0}
                for workman in AccidentWorkman.objects.filter(accident=report.accident_id)
            ]

            supervisors_list = [
                {"supervisor_name": supervisor.employee_name, "supervisor_id": supervisor.employee_id}
                for supervisor in AccidentSupervisor.objects.filter(accident=report.accident_id)
            ]

            reported_by_list = [
                {"employee_name": reported_by.employee_name, "employee_id": reported_by.employee_id}
                for reported_by in AccidentReportedBy.objects.filter(accident=report.accident_id)
            ]

            accident_reporting = AccidentReporting.objects.filter(accident_id=report.accident_id.accident_id).first()
            accident_image_base64 = None
            training_id = None  # Default to None

            if accident_reporting:
                if accident_reporting.accident_image:
                    accident_image_base64 = self.encode_image_to_base64(accident_reporting.accident_image)

                # Fetch training_id from Training model
                if accident_reporting.toolbox_train and accident_reporting.toolbox_reference_number:
                    training_instance = Training.objects.filter(training_id=accident_reporting.toolbox_reference_number.training_id).first()
                    training_id = training_instance.training_id if training_instance else None

            result = {
                "accident_report_date": report.accident_report_date,
                "whitelevel_id": report.whitelevel_id.pk,
                "accident_type": report.accident_type.accident_type_id,
                "accident_type_name": report.accident_type.accident_type,
                "severity": report.severity.severity_id if report.severity else None,
                "permit_status_id": accident_reporting.permit_status_id if accident_reporting else None,
                "ppe_status_id": accident_reporting.ppe_status_id if accident_reporting else None,
                "toolbox_reference_number_id": accident_reporting.toolbox_reference_number_id if accident_reporting else None,
                "about_the_accident": accident_reporting.about_the_accident if accident_reporting else None,
                "accident_id": report.accident_id.accident_id,
                "workmen_involved": {"count": len(workmen_list), "names": workmen_list},
                "supervisors_involved": {"count": len(supervisors_list), "names": supervisors_list},
                "reported_by": {"count": len(reported_by_list), "names": reported_by_list},
                "accident_image": accident_image_base64
            }

            # Include training_id if available
            if training_id:
                result["training_id"] = training_id

            results.append(result)

        response_data = {
            "total_count": len(results),
            "results": results
        }

        return Response(response_data, status=status.HTTP_200_OK)